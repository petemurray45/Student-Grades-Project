const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");
const { requireAdminLogin } = require('../../middleware/auth');
router.use(requireAdminLogin); // applies to all following routes

router.get("/", (req, res) => {
    res.render("admin/landing");
})


module.exports = router;