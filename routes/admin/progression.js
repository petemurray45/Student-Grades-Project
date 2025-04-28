const express = require("express");
const router = express.Router();
const connection = require("../../connection.js");

router.get("/progression", (req, res) => {
    res.render("admin/progression")
})

router.get("/rules", (req, res) => {
    res.render("admin/rules");
})

router.get("/studentProgression", (req, res) => {
    res.render("admin/studentProgression")
});




module.exports = router;