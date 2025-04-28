
// function to calculate the average grade for the student
function calculateAverageGradeAndCredits(grades){

    // variables for storing details used to calculate average

    let totalCredits = 0;
    let totalGrades = 0;
    let gradeCount = 0;

    grades.forEach(grade => {
        const { first_grade, resit_grade, grade_result, resit_result, credit_value } = grade;

        // verify if module has been passed in either the first attempt or in a resit
        const passed = (grade_result && grade_result.toLowerCase().includes("pass")) || (resit_result && resit_result.toLowerCase().includes("pass"));

        if (passed){
            totalCredits+=credit_value;
        }

        let finalGrade = first_grade;
        if (resit_grade && resit_grade > first_grade){
            finalGrade = resit_grade;
        }

        if (finalGrade !== null && finalGrade !== undefined){
            totalGrades+=finalGrade;
            gradeCount++;
        }
    });

    const averageGrade = gradeCount > 0 ? (totalGrades / gradeCount) : 0;

    return { totalCredits, averageGrade };
}

// function to check and see if required core modules have been passed
async function checkCoreModulesPassed(studentID, degree){

    const [coreModules] = await connection.promise().query(
        "SELECT module_id FROM progression_core_modules WHERE degree_programme = ?",
        [degree]
    );

    const [studentGrades] = await createConnection.promise().query(
        "SELECT g.module_id, g.grade_result, g.resit_result FROM grades g WHERE g.student_id = ?",
        [studentID]
    );

    const passedModules = new Set();
    studentGrades.forEach(grade => {
        const passed = (grade.grade_result && grade.grade_result.toLowerCase().includes("pass")) || (grade.resit_result && grade.resit_result.toLowerCase().includes("pass"));

        if (passed){
            passedModules.add(grade.module_id);
        }
    });

    // loop to check if all required core modules were passsed
    for(const core of coreModules){
        if (!passedModules.has(core.module_id)){
            return false;
        }
    }
    return true; // if all core modules passed
}

function classifyModuleResult(first_grade, resit_grade, grade_result, resit_result){

    // returns result of module based on outcomes of first grades and/or resits
    if (grade_result === "EXCUSED" || resit_result === "EXCUSED"){
        return "EXCUSED";
    } else if (grade_result === "ABSENT" || resit_result === "ABSENT"){
        return "ABSENT";
    } else if ((first_grade < 40 && (!resit_grade || resit_grade < 40))){
        return "FAIL";
    } else if ((first_grade < 40 && resit_grade >= 40) || (resit_grade >= 40)){
        return "RESIT";
    } else {
        return "PASS";
    }
}

function applyRules(totalCredits, averageGrade, coreModulesPassed){
    if (totalCredits >= 100 && averageGrade >= 40 && coreModulesPassed){
        return "Progress";
    } else if (totalCredits >= 80){
        return "Resit or repeat Year";
    } else {
        "Withdraw";
    }
}

module.exports = {
    calculateAverageGradeAndCredits,
    checkCoreModulesPassed,
    classifyModuleResult,
    applyRules

};
