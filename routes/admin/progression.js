const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { calculateAverageGradeAndCredits, checkCoreModulesPassed, applyRules, classifyModuleResult } = require("../../public/helpers/progressionCalculations.js");

async function getProgressionRule(degreeProgram, db) {
    const [rules] = await db.query(
        "SELECT * FROM progression_rules WHERE degree_programme = ?",
        [degreeProgram]
    );
    return rules[0];
}

router.get("/calculate", async (req, res)=> {
    try {
        const [students] = await connection.promise().query("SELECT DISTINCT student_id FROM grades");

        for (const student of students){
            const studentID = student.student_id;

            // fetches all grades associated with this student
            const [grades] = await connection.promise().query(
                "SELECT g.*, m.credit_value FROM grades g JOIN modules m ON g.module_id = m.module_id WHERE g.student_id = ?",
                [studentID]
            );
            if (grades.length === 0){
                continue;
            }

            // fecth the students degree
            const [degree] = await connection.promise().query(
                "SELECT pathway FROM students WHERE sID = ?",
                [studentID]
            );

            // gets academic year
            let academicYear = null;
            if (grades.length > 0){
                academicYear = grades[0].academic_year;
            }


            const studentDegree = degree[0]?.pathway || null;
            if(!studentDegree) continue;

            // get progression rules
            const rule = await getProgressionRule(studentDegree, connection.promise());
            if (!rule){
                console.warn(`No progression rule found for ${studentDegree}`);
                continue;
            }

            // calculate credits and average
            const {totalCredits, averageGrade} = calculateAverageGradeAndCredits(grades);

            // check if core modules passed
            const passedCore = await checkCoreModulesPassed(studentID, degree, connection.promise());

            // assigns individual module results
            for (const grade of grades){
                const status = classifyModuleResult(grade.first_grade, grade.resit_grade, grade.grade_result, grade.resit_result);
                await connection.promise().query(
                    "INSERT INTO progression_module_results (student_id, module_id, status, academic_year) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)",
                    [studentID, grade.module_id, status, academicYear]
                );
            }


            // variables for applying dynamic progression rules
            const meetsCredits = totalCredits >= rule.min_credits;
            const meetsGrades = averageGrade >= rule.min_average_grade;
            const meetsCoreModules = rule.all_modules_required ? passedCore : true;

            let decision = "Progress";
            
            if (!meetsCredits || meetsGrades || meetsCoreModules){

                const failedModules = grades.filter(grade => {
                    return ["FAIL", "ABSENT", "EXCUSED"].includes(
                        classifyModuleResult(grade.first_grade, grade.resit_grade, grade.grade_result, grade.resit_result)
                    );
                });

                if (failedModules.length > 0){
                    decision = "Resit Offered";
                } else if (totalCredits < 60){
                    decision = "Repeat Year (Full Time)";
                } else if (totalCredits < 20){
                    decision = "Withdrawal from Programme";
                } else if (!passedCore && rule.all_modules_required){
                    decision = "Refer to Academic Officer";
                }
            }

            await connection.promise().query(
                `INSERT INTO progression_results
                (student_id, academic_year, total_credits, average_grade, core_modules_passed, decision)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_credits = VALUES(total_credits),
                average_grade = VALUES(average_grade),
                core_modules_passed = VALUES(core_modules_passed),
                decision = VALUES(decision)`,
                [studentID, academicYear, totalCredits, averageGrade, passedCore, decision]
            );
        }
        res.send("Progression calculated for every student.")
    } catch (err){
        console.error("Error calculating progression", err);
        res.status(500).send("Error during calculation");
    }
})

router.get("/progression", (req, res) => {
    res.render("admin/progression")
})

router.get("/rules", (req, res) => {
    res.render("admin/rules");
})

router.get("/studentProgression", (req, res) => {
    res.render("admin/studentProgression")
});






module.exports = router;