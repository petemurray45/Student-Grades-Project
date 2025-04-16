const express = require("express");
const path = require('path');
const app = express();
const connection = require("./connection.js");
const modulesRoute = require("./routes/modules");
const messagesRoute = require("./routes/messaging.js");
const gradesRoute = require("./routes/grades.js");
const searchRoute = require("./routes/search.js");
const bcrypt = require("bcrypt");

app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use("/", modulesRoute);
app.use("/", messagesRoute);
app.use("/", gradesRoute);
app.use("/", searchRoute);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const users = [
    {email: 'pmurray697@gmail.com',
     password: 'oldmill50',
    }
];

app.get("/", (req, res) => {
    res.render("index");
})


// LOGIN 

app.post('/login', (req, res)=> {
    
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

        // compares password entered with hashed password

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (passwordMatch){
            if (role === "admin"){
                res.render("landing", { user });
            } else {
                res.render("studentLanding", { user });
            }
        } else {
            res.render("index", { error: "Invalid Password"});
        }
    })
})


app.listen(3000, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})