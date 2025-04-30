


// function to calculate the average grade for the student
function calculateAverageGradeAndCredits(grades, academicLevel){

    // variables for storing details used to calculate average

    let totalCredits = 0;
    let totalGrades = 0;
    let gradeCount = 0;
    const filteredGrades = grades.filter(grade => grade.academic_level === academicLevel);
    const processedModules = new Set();

        filteredGrades.forEach(grade => {

            const { module_id, first_grade, resit_grade, grade_result, resit_result, credit_value } = grade;
            

            if (processedModules.has(module_id)) return;
            processedModules.add(module_id);

            // verify if module has been passed in either the first attempt or in a resit
            const passed = (grade_result && grade_result.toLowerCase().includes("pass")) || (resit_result && resit_result.toLowerCase().includes("pass"));

            if (passed){
                totalCredits+=credit_value;
            }

            let finalGrade = first_grade;

            if (resit_grade && resit_grade > first_grade) {
                if (resit_result && resit_result.toLowerCase() === "pass capped") {
                    finalGrade = Math.min(resit_grade, 40);
                } else {
                    finalGrade = resit_grade;
                }
            }

            if (finalGrade !== null && finalGrade !== undefined){
                totalGrades+=finalGrade;
                gradeCount++;
            }
        })

    const averageGrade = Math.round(gradeCount > 0 ? (totalGrades / gradeCount) : 0);
    return { totalCredits, averageGrade };
}

// function to check and see if required core modules have been passed
async function checkCoreModulesPassed(studentID, degree, academicLevel, connection){

    const [coreModules] = await connection.promise().query(
        "SELECT module_id FROM progression_core_modules WHERE degree_programme = ? AND academic_level = ?",
        [degree, academicLevel]
    );

    if(coreModules.length === 0){
        return true;
    }

    const [studentGrades] = await connection.promise().query(
        "SELECT g.module_id, g.grade_result, g.resit_result FROM grades g JOIN modules m ON g.module_id = m.module_id WHERE g.student_id = ? AND m.academic_level = ?",
        [studentID, academicLevel]
    );

    const passedModules = new Set();
    studentGrades.forEach(grade => {
        const passed = (grade.grade_result && grade.grade_result.toLowerCase().includes("pass")) || (grade.resit_result && grade.resit_result.toLowerCase().includes("pass"));

        if (passed){
            passedModules.add(grade.module_id);
        }
    });

    console.log("Checking core modules for:", studentID, degree, academicLevel);
    console.log("Modules passed:", passedModules);
    console.log("Required core modules:", coreModules.map(c => c.module_id));

    // loop to check if all required core modules were passsed
    return coreModules.some(core => passedModules.has(core.module_id));

    
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



module.exports = {
    calculateAverageGradeAndCredits,
    checkCoreModulesPassed,
    classifyModuleResult
    
    

};
