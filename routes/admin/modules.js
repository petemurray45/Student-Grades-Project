const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");


router.get("/modules", (req, res)=> {
    let readSql = `SELECT module_id, subj_code, module_title, credit_value, core_module FROM modules ORDER BY module_title ASC`;

    connection.query(readSql, (err, rows)=>{
        if (err) throw err;
        res.render("admin/modules", {modules: rows})

    });
        
});

router.post("/modules/update", (req, res)=> {
    const { module_id, subj_code, module_title, credit_value, core_module} = req.body;
    const updateQuery = `
    UPDATE modules
    SET subj_code = ?, module_title = ?, credit_value = ?, core_module = ?
    WHERE module_id = ?`;

    connection.query(updateQuery, [subj_code, module_title, credit_value, core_module, module_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({success: false});
        }
        res.json({success:true});
    });
})

module.exports = router;
