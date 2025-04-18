const express = require("express");
const router = express.Router();
const connection = require("../connection.js")
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
    res.render("index");
})

router.post('/login', (req, res)=> {
    
    const {identifier, password, role} = req.body;

    // selects an identifyer based on their account role
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
        console.log("Session set:", req.session.user);

        // compares password entered with hashed password

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (passwordMatch){
            if (role === "admin"){
                res.render("admin/landing", { user });
                console.log(req.session.user);
            } else {
                res.render("student/studentLanding", { user });
            }
        } else {
            res.render("index", { error: "Invalid Password"});
        }
    })
})


module.exports = router;

