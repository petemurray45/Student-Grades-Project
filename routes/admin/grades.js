const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");
const upload = multer({dest:"uploads/"});
const { requireAdminLogin } = require('../../middleware/auth');
router.use(requireAdminLogin); // applies to all following routes

router.get("/", async (req, res) => {
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

router.get("/module/:id", (req, res)=>{
    const moduleId = req.params.id;

    console.log("Module ID received:", moduleId);
    const readSql = `
    SELECT s.sID AS student_id, CONCAT(s.first_name, ' ', s.last_name) AS name, g.module_id, g.first_grade, UPPER(g.grade_result) AS grade_result, 
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

router.post("/update", async (req, res)=>{
    
    const {student_id, module_id, first_grade, grade_result, resit_grade, resit_result, semester, academic_year} = req.body;

    const sql = `
    UPDATE grades
    SET first_grade = ?, grade_result = ?, resit_grade = ?, resit_result = ?, semester = ?, academic_year = ?
    WHERE student_id = ? AND module_id = ?`;

    const values = [first_grade || null,
        grade_result || null,
        resit_grade === "" ? null : resit_grade,
        resit_result || null,
        semester || null,
        academic_year || null,
        student_id,
        module_id
    ];

    connection.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Update Failed"});

        if (result.affectedRows === 0) {
            console.error('No rows were updated — likely wrong student_id or module_id');
            return res.status(404).json({ error: "No record updated" });
        }
        res.json({ success: true });
    })
});

router.post("/upload", upload.single("gradesCSV"), (req, res) => {
    const filePath = req.file.path;
    const results = [];
    let added = 0, updated = 0;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", async ()=> {
            try {
                
                for (const row of results){
                    const { student_id, subj_code, subj_catalog, academic_year, first_grade, grade_result, resit_grade, resit_result, semester } = row;

                    
                    
                    // grab module id from subj code and subj catalog 
                    const moduleResult = await new Promise((resolve, reject) => {
                        connection.query(
                            "SELECT module_id FROM modules WHERE subj_code = ? AND subj_catalog = ?",
                            [subj_code, subj_catalog],
                            (err, results) => {
                                if (err) return reject(err);
                                if (results.length === 0) return resolve(null);
                                resolve(results[0].module_id);
                            }
                        );
                    });

                    if (!moduleResult) continue; // skips the row parsed if the module isnt found

                    // this checks if the grade record already exists
                    const doesExist = await new Promise((resolve, reject) => {
                        connection.query(
                            'SELECT * FROM grades WHERE student_id = ? AND module_id = ? AND academic_year = ?',
                            [student_id, moduleResult, academic_year],
                            (err, rows) => {
                                if (err) return reject(err);
                                resolve(rows.length > 0);
                            }
                        )
                    })
                    
                    // updates the existing row
                    if (doesExist){
                        await new Promise((resolve, reject) => {
                            connection.query(
                                `UPDATE grades SET first_grade = ?, grade_result = ?, resit_grade = ?, resit_result = ?, semester = ?
                                WHERE student_id = ? AND module_id = ? AND academic_year = ?`,
                                [first_grade, grade_result, resit_grade, resit_result, semester, student_id, moduleResult, academic_year],
                                (err) => {
                                    if (err) return reject(err);
                                    updated++;
                                    resolve();
                                }
                            )
                        })
                    } else {
                        // inserts new row if grade record doesn't already exist
                        await new Promise((resolve, reject) => {
                            connection.query(
                                `INSERT INTO grades (student_id, module_id, academic_year, first_grade, grade_result, resit_grade, resit_result, semester)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [student_id, moduleResult, academic_year, first_grade, grade_result, resit_grade, resit_result, semester],
                                (err) => {
                                    if (err) return reject(err);
                                    added++;
                                    resolve();
                                }
                            )
                        })
                    }
                }
                fs.unlinkSync(filePath);
                res.json({added, updated});
            } catch(err){
                console.error(err);
                res.status(500).json({error: "Failed to read CSV"});
            }
        }) 
})

module.exports = router;