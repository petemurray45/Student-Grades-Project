const express = require("express");
const router = express.Router();
const connection = require("../connection.js");

router.get("/search", (req, res)=> {
    let readSql1 = `SELECT * FROM students ORDER BY last_name ASC`;

    connection.query(readSql1, (err, rows)=> {
        if (err) throw err;
        res.render("search", {students : rows});
    })
})

router.get("/searchAddNew", (req, res)=> {
    res.render("searchAddNew");
})

router.post("/students/update", (req, res)=> {
    const { sID, first_name, last_name, pathway, year_of_study, study_status} = req.body;
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
        res.redirect("/search");
    })
})

router.post("/students/delete", (req, res)=> {
    const sID = req.body.sID;
    const deleteSql = `DELETE FROM students WHERE sID = ?`;

    connection.query(deleteSql, [sID], (err, result)=>{
        if (err) throw err;
        res.redirect("/search");
    })
})

module.exports = router;
