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
    
    const query = "SELECT sID, CONCAT (first_name, ' ', last_name) AS name FROM students ORDER BY name ASC"
    connection.query(query, (err, students)=> {
        if (err) throw err;
        res.render("send", { students });
    })
})

router.get("/inbox", (req, res)=> {
    const user = req.session.user;

    const recipientId = user.role === "student" ? user.student_id : user.username;
    const sqlQuery = `
    SELECT m.message_text, m.timestamp, m.sender_id, u.username, s.first_name, s.last_name, s.student_id
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.username
    LEFT JOIN students s ON m.sender_id = s.student_id
    WHERE m.recipient_id = ?
    ORDER BY m.timestamp DESC`;

    connection.query(sqlQuery, [recipientId], (err, messages) => {
        if (err) throw err;
        res.render("inbox", { messages : messages});
    })
})

router.post("/send", (req, res) => {
    const {recipient_ids, message} = req.body;
    const sender = req.session.user;
    const senderID = sender.role === "student" ? sender.student_id : sender.username;

    // if there is only one reciever of the message wrap it in an array
    const recipientArray = recipient_ids.split(",").filter(Boolean);
    const values = recipientArray.map(recipientId => [senderID, recipientId, message]);
    const sql = `INSERT INTO messages (sender_id, recipient_id, message) VALUES ?`;

    connection.query(sql, [values], (err, result)=> {
        if (err) throw err;
        res.redirect("/messaging")
    })
})



module.exports = router;