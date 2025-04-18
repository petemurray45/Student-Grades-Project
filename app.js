const express = require("express");
const path = require('path');
const app = express();
const session = require("express-session");

app.use(session({
    secret: "peterspassword1",
    resave: false,
    saveUninitialized: true
}));
//admin routes
const loginRoute = require("./routes/login.js");
const modulesRoute = require("./routes/admin/modules");
const messagesRoute = require("./routes/admin/messaging.js");
const gradesRoute = require("./routes/admin/grades.js");
const searchRoute = require("./routes/admin/search.js");

//student routes
const studentMessages = require("./routes/student/messaging.js");
const { log } = require("console");



app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use("/", loginRoute);
app.use("/", modulesRoute);
app.use("/", messagesRoute);
app.use("/", gradesRoute);
app.use("/", searchRoute);

app.use("/", studentMessages);




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.listen(3000, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})