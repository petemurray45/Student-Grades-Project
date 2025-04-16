const express = require("express");
const router = express.Router();
const connection = require("../connection.js");

router.get("/grades", async (req, res) => {
    const [rows] = await connection.query("SELECT * FROM modules ORDER BY module_title ASC");
    res.render("grades", {modules:rows});
})

router.get("/grades/module/:id", (req, res)=>{
    const moduleId = req.params.id;

    console.log("Module ID received:", moduleId);
    const readSql =` SELECT *
        FROM grades
        WHERE module_id = ?`;

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