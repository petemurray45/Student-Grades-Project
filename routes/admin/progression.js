const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { calculateAverageGradeAndCredits, checkCoreModulesPassed, classifyModuleResult } = require("../../public/helpers/progressionCalculations.js");

async function getProgressionRule(degreeProgram, academic_level, db) {
    const [rules] = await db.query(
        "SELECT * FROM progression_rules WHERE degree_programme = ? AND academic_level = ?",
        [degreeProgram, academic_level]
    );
    return rules[0];
}

router.get("/studentProgression", async (req, res) => {
    try {
        const [results] = await connection.promise().query(
            `SELECT pr.*, 
            s.first_name, 
            s.last_name, 
            CONCAT(s.first_name, ' ', s.last_name) AS name
            FROM progression_results pr
            JOIN students s ON pr.student_id = s.sID
            ORDER BY s.first_name ASC`
        );
        res.render("admin/studentProgression", { results });
    } catch (err){
        console.error("Error fetching progression results", err);
        res.status(500).send("Error loading progression data");
    }
})

function decideResult(grades, passedCore, totalCredits, rule) {
    const failedModules = grades.filter(grade =>
        ["FAIL", "ABSENT", "EXCUSED"].includes(
            classifyModuleResult(grade.first_grade, grade.resit_grade, grade.grade_result, grade.resit_result)
        )
    );

    if(!passedCore && rule.academic_level === "L2"){
        return "Refer to Academic Officer";
    }

    if (totalCredits < 20) {
        return "Withdrawal from Programme";
    } else if (totalCredits < 60) {
        return "Repeat Year (Full Time)";
    } else if (failedModules.length > 0) {
        return "Resit Offered";
    } else if (!passedCore && rule.all_modules_required) {
        return "Refer to Academic Officer";
    } else {
        return "Progress";
    }
}

router.get("/calculate", async (req, res)=> {
    try {

        
        
        const [students] = await connection.promise().query(
            "SELECT DISTINCT s.sID AS student_id FROM students s"
        );

        for (const student of students){
            const studentID = student.student_id;

            // fecth the students degree
            const [degree] = await connection.promise().query(
                "SELECT pathway, academic_level FROM students WHERE sID = ?",
                [studentID]
            );

            const studentDegree = degree[0]?.pathway || null;
            const academicLevel = degree[0]?.academic_level;

            // fetches all grades associated with this student
            const [grades] = await connection.promise().query(
                "SELECT g.*, m.academic_level, m.credit_value FROM grades g JOIN modules m ON g.module_id = m.module_id WHERE g.student_id = ? AND m.academic_level = ?",
                [studentID, academicLevel]
            );
            if (grades.length === 0){
                continue;
            }

            // gets academic year
            let academicYear = null;
            if (grades.length > 0){
                academicYear = grades[0].academic_year;
            }

            if(!studentDegree) continue;

            // get progression rules
            const rule = await getProgressionRule(studentDegree, academicLevel, connection.promise());
            if (!rule){
                console.warn(`No progression rule found for ${studentDegree}`);
                continue;
            }

            // calculate credits and average
            const {totalCredits, averageGrade} = calculateAverageGradeAndCredits(grades, academicLevel);

            // check if core modules passed
            const passedCore = await checkCoreModulesPassed(studentID, studentDegree, academicLevel, connection);

            // assigns individual module results
            for (const grade of grades){
                const status = classifyModuleResult(grade.first_grade, grade.resit_grade, grade.grade_result, grade.resit_result);
                await connection.promise().query(
                    "INSERT INTO progression_module_results (student_id, module_id, status, academic_year, academic_level) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), academic_level = VALUES(academic_level)",
                    [studentID, grade.module_id, status, academicYear, academicLevel]
                );
            }


            // variables for applying dynamic progression rules

            const isLevelOne = rule.academic_level === "L1";
            const meetsCredits = totalCredits >= rule.min_credits;
            const meetsGrades = averageGrade >= rule.min_average_grade;
            const meetsCoreModules = rule.all_modules_required ? passedCore : true;

            let decision = "Progress";
            
            if (isLevelOne) {
                if (!meetsCredits || !meetsGrades || !meetsCoreModules) {
                    decision = decideResult(grades, passedCore, totalCredits, rule);
                }
            } else {
                if (!meetsCredits || !meetsCoreModules) {
                    decision = decideResult(grades, passedCore, totalCredits, rule);
                }
            }

            await connection.promise().query(
                `INSERT INTO progression_results
                (student_id, academic_year, total_credits, average_grade, core_modules_passed, decision, academic_level)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_credits = VALUES(total_credits),
                average_grade = VALUES(average_grade),
                core_modules_passed = VALUES(core_modules_passed),
                decision = VALUES(decision),
                academic_level = VALUES(academic_level)`,
                [studentID, academicYear, totalCredits, averageGrade, passedCore, decision, academicLevel]
            );
        }
        res.send("Progression calculated for every student.")
    } catch (err){
        console.error("Error calculating progression", err);
        res.status(500).send("Error during calculation");
    }
})

router.get("/rules", async (req, res) => {
    const [rules] = await connection.promise().query("SELECT * FROM progression_rules");
    res.render("admin/rules", { progressionRules: rules });
  });
  
  router.post("/rules/update", async (req, res) => {
    const { id, degree_programme, academic_level, min_credits, min_average_grade, all_modules_required } = req.body;
  
    await connection.promise().query(`
      UPDATE progression_rules
      SET degree_programme = ?, academic_level = ?, min_credits = ?, min_average_grade = ?, all_modules_required = ?
      WHERE id = ?
    `, [degree_programme, academic_level, min_credits, min_average_grade, all_modules_required, id]);
  
    res.redirect("/admin/rules");
});

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