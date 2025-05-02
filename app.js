const express = require("express");
const path = require('path');
const app = express();
const session = require("express-session");

app.use(session({
    secret: "peterspassword1",
    resave: false,
    saveUninitialized: true
}));

// permits user session data to be used in all views (mainly for sidebar)
app.use((req, res, next) => {
    if (req.session.user) {
      res.locals.user = req.session.user; 
    }
    next();
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));

//admin routes
const loginRoute = require("./routes/login.js");
const modulesRoute = require("./routes/admin/modules");
const messagesRoute = require("./routes/admin/messaging.js");
const gradesRoute = require("./routes/admin/grades.js");
const searchRoute = require("./routes/admin/search.js");
const progressionRoute = require("./routes/admin/progression.js");
const statisticsRoute = require("./routes/admin/statistics.js");
const landingRoute = require("./routes/admin/landing.js");
const loginPage = require("./routes/login.js");

//student routes
const studentMessages = require("./routes/student/messaging.js");
const studentProgression = require("./routes/student/progression.js");
const studentAccount = require("./routes/student/account.js");
const studentLanding = require("./routes/student/landing.js");
const { log } = require("console");



app.use(express.urlencoded({ extended: true}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use("/", loginRoute);
app.use("/admin/modules", modulesRoute);
app.use("/admin/messaging", messagesRoute);
app.use("/admin/grades", gradesRoute);
app.use("/admin/search", searchRoute);
app.use("/admin/landing", landingRoute);
app.use("/student/messaging", studentMessages);
app.use("/student/progression", studentProgression);
app.use("/student/account", studentAccount);
app.use("/student/studentLanding", studentLanding);
app.use("/admin/progression", progressionRoute);
app.use("/admin/statistics", statisticsRoute);
app.use("/login", loginPage);





app.listen(3000, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})