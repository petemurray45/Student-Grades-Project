


// function to calculate the average grade for the student
function calculateAverageGradeAndCredits(grades, academicLevel){

    // variables for storing details used to calculate average

    let totalCredits = 0;
    let totalGrades = 0;
    let gradeCount = 0;
    const filteredGrades = grades.filter(grade => grade.academic_level === academicLevel);
    const groupedModules = new Map();

    filteredGrades.forEach(grade => {
        const key = grade.module_id;
        if(!groupedModules.has(key)){
            groupedModules.set(key, []);
        }
        //group modules by id
        groupedModules.get(key).push(grade);
    })

    groupedModules.forEach(attempts => {
        //picks the best attempt at the module
        let bestAttempt = null;
        let bestGrade = -1;

        attempts.forEach(grade => {
            const {first_grade, resit_grade, grade_result, resit_result, credit_value} = grade;

            let passed = false;
            let gradeValue = Number(first_grade);
            
            const parsedResit = Number(resit_grade);
            if (!isNaN(resit_grade) && resit_grade > first_grade) {
                if (resit_result && resit_result.toLowerCase() === "pass capped") {
                    gradeValue = Math.min(parsedResit, 40);
                    passed = true;
                } else if (resit_result && resit_result.toLowerCase().includes("pass")) {
                    gradeValue = parsedResit;
                    passed = true;
                }
            } else if (grade_result && ['pass', 'pass capped'].includes(grade_result.toLowerCase())) {
                passed = true;
            } else if (
                grade_result && grade_result.toLowerCase() === 'excused' &&
                (!resit_result || resit_result.toLowerCase() === 'excused')
            ) {
                passed = false; // excused shouldn't count as a pass or a fail
            }

            const credit = Number(credit_value);
            if (passed && gradeValue > bestGrade && !isNaN(credit)){
                bestGrade = gradeValue;
                bestAttempt = {grade: gradeValue, credit_value: credit};
            }
        })

        if (bestAttempt){
            totalCredits += bestAttempt.credit_value;
            totalGrades += bestAttempt.grade;
            gradeCount++;
        }
    });
    

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
