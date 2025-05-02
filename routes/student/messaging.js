const express = require("express");
const router = express.Router();
const connection = require("../../connection.js")
const { requireStudentLogin } = require("../../middleware/auth");
router.use(requireStudentLogin); 


router.get("/",  (req, res) => {
    res.render("student/studentMessaging");
})

router.get("/studentSend", (req, res)=> {
    
    const query = "SELECT sID, CONCAT (first_name, ' ', last_name) AS name FROM students ORDER BY name ASC"
    connection.query(query, (err, students)=> {
        if (err) throw err;
        res.render("student/studentSend", { students });
    })
})

router.get("/studentInbox", (req, res)=> {
    const user = req.session.user;

    
    const recipientId = user.role === "student" ? user.student_id : user.username;
    const sqlQuery = `
    SELECT m.message_text, m.timestamp, m.sender_id, u.username, s.first_name, s.last_name, s.sID
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.username
    LEFT JOIN students s ON m.sender_id = s.sID
    WHERE m.recipient_id = ?
    ORDER BY m.timestamp DESC`;

    connection.query(sqlQuery, [recipientId], (err, messages) => {
        if (err) throw err;
        console.log(messages); 
        res.render("student/studentInbox", { messages : messages});
    })
})

router.post("/studentSend",(req, res) => {
    const {recipient_ids, message} = req.body;
    const sender = req.session.user;
    const senderID = sender.role === "student" ? sender.student_id : sender.username;

    // if there is only one reciever of the message wrap it in an array
    const recipientArray = recipient_ids.split(",").filter(Boolean);
    const values = recipientArray.map(recipientId => [senderID, recipientId, message]);
    const sql = `INSERT INTO messages (sender_id, recipient_id, message) VALUES ?`;

    connection.query(sql, [values], (err, result)=> {
        if (err) throw err;
        
    })
})

module.exports = router;