const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { requireStudentLogin } = require('../../middleware/auth');
router.use(requireStudentLogin); // applies to all following routes

router.get("/", async (req, res) => {
    try {
        const studentId = req.session.student_id; // grabs student id from session

        if (!studentId) {
            return res.redirect('/index'); // error handler to redirect to login if not authenticated
        }

        const [modules] = await connection.promise().query(`
            SELECT 
                m.module_title AS title,
                m.credit_value AS creditValue,
                m.subj_code AS pathway,
                g.first_grade AS grade,
                g.resit_grade,
                g.grade_result AS result
            FROM grades g
            JOIN modules m ON g.module_id = m.module_id
            WHERE g.student_id = ?
            ORDER BY m.module_title ASC
        `, [studentId]);

        const [progressionResults] = await connection.promise().query(
            `SELECT 
                pr.academic_year,
                pr.total_credits AS creditsAchieved,
                pr.average_grade AS average,
                pr.core_modules_passed AS corePassed,
                pr.decision,
                pr.academic_level,
                pr.student_id
            FROM progression_results pr
            WHERE pr.student_id = ?
            ORDER BY pr.academic_year DESC`,
            [studentId]
        );

        const [studentPathway] = await connection.promise().query(
            `SELECT pathway, academic_level FROM students WHERE sID = ?`,
            [studentId]
        );

        const {pathway, academic_level} = studentPathway[0];

        const [rules] = await connection.promise().query(
            `SELECT min_credits AS credits, min_average_grade AS minimum_average 
            FROM progression_rules 
            WHERE degree_programme = ? AND academic_level = ?`,
            [pathway, academic_level]
        );

        const rule = rules[0] || { credits: 0, minimum_average: 0};

        // combine resukts for format to ejs
        const studentDetails = progressionResults.map(row => ({
            ...row,
            credits: rule.credits,
            minimum_average: rule.minimum_average
        }));




        res.render('student/progression', { modules, studentDetails });
    } catch (err) {
        console.error('Error fetching student progression data:', err);
        res.status(500).send('Server error');
    }
})



module.exports = router;