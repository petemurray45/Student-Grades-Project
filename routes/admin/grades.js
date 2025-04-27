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

    connection.query(readSql, [moduleId], (err, grades)=> {
        if (err) {
            console.error("QUERY ERROR:", err);
            return res.status(500).send("Database error");
        }
        console.log("Returning rows:", grades);
        res.json(grades);
    })
})

router.post("/grades/update", async (req, res)=>{
    
    const {student_id, first_grade, grade_result, resit_grade, resit_result, semester, academic_year} = req.body;

    const sql = `
    UPDATE grades
    SET first_grade = ?, grade_result = ?, resit_grade = ?, resit_result = ?, semester = ?, academic_year = ?
    WHERE student_id = ?`;

    connection.query(sql, [student_id, first_grade, grade_result, resit_grade, resit_result, semester, academic_year], (err) => {
        if (err) return res.status(500).json({ error: "Update Failed"});
        

    } )
});

module.exports = router;