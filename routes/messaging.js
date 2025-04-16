const express = require("express");
const router = express.Router();
const connection = require("../connection.js")


router.get("/messaging", (req, res)=> {
    res.render("messaging");
})

router.get("/inbox", (req, res)=> {
    res.render("inbox");
})

router.get("/send", (req, res)=> {
    const searchName = req.query.searchName;
    const query = searchName
    ? `SELECT * FROM students WHERE first_name LIKE ?`
    : `SELECT * FROM students`;

    const values = searchName ? [`%${searchName}`] : [];

    connection.query(query, values, (err, students) => {
        if (err) throw err;
        res.render("send", { students });
    })
})

router.post("/send", (req, res) => {
    const {recipients, message} = req.body;
    const sender = req.session.user;
    const senderID = sender.role === "student" ? sender.student_id : sender.username;

    // if there is only one reciever of the message wrap it in an array
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
    const values = recipientArray.map(recipientId => [senderID, recipientId, message]);
    const sql = `INSERT INTO messages (sender_id, recipient_id, message) VALUES ?`;

    connection.query(sql, [values], (err, result)=> {
        if (err) throw err;
        res.redirect("/messaging")
    })
})

module.exports = router;