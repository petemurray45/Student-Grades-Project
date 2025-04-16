const express = require("express");
const router = express.Router();
const connection = require("../connection.js");

router.get("/modules", (req, res)=> {
    let readSql = `SELECT * FROM modules ORDER BY LOWER(TRIM(module_title)) ASC`;

    connection.query(readSql, (err, rows)=>{
        if (err) throw err;
        res.render("modules", {modules : rows});

    });
        
});

router.post("/modules/update", (req, res)=> {
    const { module_id, module_title, credit_value, core_module} = req.body;
    const updateQuery = `
    UPDATE modules
    SET module_title = ?, credit_value = ?, core_module = ?
    WHERE module_id = ?`;

    connection.query(updateQuery, [module_title, credit_value, core_module, module_id], (err) => {
        if (err) throw err;
        res.redirect("/modules");
    });
})

module.exports = router;
