const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");

router.get("/grades", async (req, res) => {
    const sql = `SELECT module_id, TRIM(module_title) AS module_title
    FROM modules
    ORDER BY TRIM(module_title) ASC`;

    connection.query(sql, (err, rows) => {
        if (err){
            console.log("Database error", err);
            return res.status(500).send("Internal server error");
        }
        res.render("admin/grades", {modules: rows});
    })
    
})

router.get("/grades/module/:id", (req, res)=>{
    const moduleId = req.params.id;

    console.log("Module ID received:", moduleId);
    const readSql = `
    SELECT s.sID, CONCAT(s.first_name, ' ', s.last_name) AS name, g.first_grade, UPPER(g.grade_result) AS grade_result, 
    g.resit_grade, UPPER(g.resit_result) AS resit_result, g.semester, g.academic_year
    FROM grades g
    JOIN students s ON g.student_id = s.sID
    WHERE g.module_id = ?
    ORDER BY s.first_name, s.last_name`

    connection.query(readSql, [moduleId], (err, rows)=> {
        if (err) {
            console.error("QUERY ERROR:", err);
            return res.status(500).send("Database error");
        }
        console.log("Returning rows:", rows);
        res.json(rows);
    })
})

router.post("/grades/update", async (req, res)=>{
    const updates = req.body.grades;

    for (const entry of updates){
        await connection.query(`
            UPDATE grades
            SET first_grade = ?
            WHERE student_id = ? AND module_id = ?`,
            [entry.first_grade, entry.student_id, entry.module_id]);
    };
    res.json({message : 'Grades updates successfully'})
});

module.exports = router;