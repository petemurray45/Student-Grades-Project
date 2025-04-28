const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");

router.get("/progression", (req, res) => {
    res.render("admin/progression")
})




module.exports = router;