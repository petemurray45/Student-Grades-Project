const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");

router.get("/statistics", (req, res)=> {
    res.render("admin/statistics");
})

router.get("/studentSummary", (req, res)=> {
    const query = "SELECT sID, CONCAT (first_name, ' ', last_name) AS name FROM students ORDER BY name ASC"
    connection.query(query, (err, students)=> {
        if (err) throw err;
        res.render("admin/studentSummary", { students });
    })
})

router.get('/studentSummary/:studentId', async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const [summary] = await connection.promise().query(
            `SELECT s.sID AS student_id, CONCAT(s.first_name, ' ', s.last_name) AS name, 
            s.pathway, p.total_credits, p.average_grade, p.decision
            FROM students s
            JOIN progression_results p ON s.sID = p.student_id
            WHERE s.sID = ?`, 
            [studentId]
        );

        const [academicLevelResult] = await connection.promise().query(
            `SELECT academic_level FROM students WHERE sID = ?`,
            [studentId]
        );
        const academicLevel = academicLevelResult[0]?.academic_level;

        const [modules] = await connection.promise().query(
            `SELECT 
            m.module_title,
            CONCAT(m.subj_code, m.subj_catalog) AS module_code,
            m.credit_value,
            g.first_grade,
            g.grade_result,
            g.resit_grade,
            g.resit_result,
            ROW_NUMBER() OVER (PARTITION BY g.module_id ORDER BY g.academic_year, g.first_grade DESC) AS attempt_number
            FROM grades g
            JOIN modules m ON g.module_id = m.module_id
            WHERE g.student_id = ? AND m.academic_level = ?`,
            [studentId, academicLevel]
        );

        res.json({
            success: true,
            summary: summary[0],
            modules: modules
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

router.get("/trends", (req, res) => {
    res.render("admin/trends");
})







module.exports = router;