const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { requireAdminLogin } = require('../../middleware/auth');
router.use(requireAdminLogin); // applies to all following routes



router.get("/", (req, res)=> {
    let readSql = `SELECT module_id, subj_code, module_title, credit_value, core_module FROM modules ORDER BY TRIM(module_title) ASC`;

    connection.query(readSql, (err, rows)=>{
        if (err) throw err;
        res.render("admin/modules", {modules: rows})

    });
        
});

router.post("/update", (req, res)=> {
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
