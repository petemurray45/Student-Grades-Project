const express = require("express");
const router = express.Router();
const connection = require("../connection.js")
const bcrypt = require("bcrypt");


router.get("/", (req, res) => {
    res.render("index");
})

router.post('/login', (req, res)=> {
    
    const {identifier, password, role} = req.body;

    // selects an identifier based on their account role
    const indentifierField = role === "admin" ? "username" : "student_id";
    const identifierValue = identifier;

    const sql = `SELECT * FROM users WHERE ${indentifierField} = ? and role = ?`;

    connection.query(sql, [identifierValue, role], async (err, results) => {
        if (err) throw err;

        if (results.length === 0){
            return res.render("index", { error : "Invalid User"});
        }



        const user = results[0];
        req.session.user = user;
        if (role === "student"){
            req.session.student_id = user.student_id;
        }
        console.log("Session set:", req.session.user);

        // compares password entered with hashed password

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch){
            return res.render("index", {error: "Invalid Password"});
        }

        if(role === "admin"){
            req.session.user = {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            };
            return res.render("admin/landing");
        }

        const [studentResults] = await connection.promise().query(
            "SELECT first_name, last_name FROM students WHERE sID = ?",
            [user.student_id]
        );

        if (!studentResults.length) {
            return res.render("index", { error: "Student details not found." });
        }
        const student = studentResults[0];
        req.session.user = {
            user_id: user.user_id,
            student_id: user.student_id,
            role: user.role,
            first_name: student.first_name,
            last_name: student.last_name,
            profile_image: user.profile_image 
        };
        console.log("Session set:", req.session.user);
        res.render("student/studentLanding", { user });
    })
})

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Logout failed");
        }
        res.redirect("/login"); // redirect to login page after logout
    });
});


module.exports = router;

