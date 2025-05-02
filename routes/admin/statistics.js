const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { requireAdminLogin } = require('../../middleware/auth');
router.use(requireAdminLogin); // applies to all following routes


router.get("/", (req, res)=> {
    console.log("Accessing statistics as:", req.session.user); 
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

router.get("/trends", async (req, res) => {
    try {
        const [pathwayStats] = await connection.promise().query(`
            SELECT 
                s.pathway,
                COUNT(*) AS total_students,
                SUM(CASE WHEN pr.decision = 'Progress' THEN 1 ELSE 0 END) AS progressed,
                SUM(CASE WHEN pr.decision = 'Repeat Year (Full Time)' THEN 1 ELSE 0 END) AS repeating,
                SUM(CASE WHEN pr.decision = 'Withdrawal from Programme' THEN 1 ELSE 0 END) AS withdrawn,
                ROUND(SUM(CASE WHEN pr.decision = 'Progress' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS progression_rate
            FROM progression_results pr
            JOIN students s ON pr.student_id = s.sID
            WHERE s.pathway IN ('IFSY', 'BSAS')
            GROUP BY s.pathway
        `);

        const [moduleStats] = await connection.promise().query(`
            SELECT 
              m.module_title,
              ROUND(AVG(CASE 
                WHEN g.resit_grade IS NOT NULL AND g.resit_grade > g.first_grade THEN g.resit_grade 
                ELSE g.first_grade 
              END), 1) AS average_grade,
              
              MAX(CASE 
                WHEN g.resit_grade IS NOT NULL AND g.resit_grade > g.first_grade THEN g.resit_grade 
                ELSE g.first_grade 
              END) AS highest_grade,
      
              MIN(CASE 
                WHEN g.resit_grade IS NOT NULL AND g.resit_grade > g.first_grade THEN g.resit_grade 
                ELSE g.first_grade 
              END) AS lowest_grade,
      
              COUNT(g.resit_grade) AS resits,
              
              ROUND(SUM(CASE 
                WHEN g.grade_result = 'FAIL' OR g.resit_result = 'FAIL' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS fail_percent,
              
              ROUND(SUM(CASE 
                WHEN g.grade_result LIKE '%PASS%' OR g.resit_result LIKE '%PASS%' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS pass_percent
      
            FROM grades g
            JOIN modules m ON g.module_id = m.module_id
            GROUP BY m.module_title
            ORDER BY m.module_title ASC
          `);
          
        res.render("admin/trends", {pathwayStats, moduleStats});
    } catch (err){
        console.error("Failed to fetch pathway stats");
        res.status(500).send("Error loading statistics");
    }
})









module.exports = router;