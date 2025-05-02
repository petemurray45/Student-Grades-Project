const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { requireAdminLogin } = require('../../middleware/auth');
router.use(requireAdminLogin); // applies to all following routes


router.get("/", (req, res)=> {
    let readSql1 = `SELECT * FROM students ORDER BY last_name ASC`;

    connection.query(readSql1, (err, rows)=> {
        if (err) throw err;
        res.render("admin/search", {students : rows});
    })
})

router.get("/searchAddNew", (req, res)=> {
    res.render("admin/addStudent");
})

router.post("/update", (req, res)=> {
    const {first_name, last_name, pathway, year_of_study, study_status, sID} = req.body;
    console.log("Update values:", first_name, last_name, pathway, year_of_study, study_status, sID);
    const sqlUpdate = `
    UPDATE students SET
    first_name = ?,
    last_name = ?,
    pathway = ?,
    year_of_study = ?,
    study_status = ?
    WHERE sID = ?
    `;

    connection.query(sqlUpdate, [first_name, last_name, pathway, year_of_study, study_status, sID], (err)=> {
        if (err) throw err;
        res.redirect("/admin/search");
    })
})

router.post("/addStudent", (req, res) => {
    const { sID, first_name, last_name, pathway, year_of_study, academic_level, study_status } = req.body;

    const insertSql = `
        INSERT INTO students (sID, first_name, last_name, pathway, year_of_study, academic_level, study_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertSql, [sID, first_name, last_name, pathway, year_of_study, academic_level, study_status], (err) => {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).send("Database error");
        }
        res.redirect("/admin/search");
    });
});

router.post("/students/delete", (req, res)=> {
    const sID = req.body.sID;
    const deleteSql = `DELETE FROM students WHERE sID = ?`;

    connection.query(deleteSql, [sID], (err, result)=>{
        if (err) throw err;
        res.redirect("admin/search");
    })
})

module.exports = router;
