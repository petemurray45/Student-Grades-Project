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