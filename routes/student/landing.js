const express = require("express");
const router = express.Router();
const connection = require("../../connection.js")
const { requireStudentLogin } = require("../../middleware/auth");
router.use(requireStudentLogin); 

router.get("/", (req, res)=> {
    res.render("student/studentLanding");
})



module.exports = router;