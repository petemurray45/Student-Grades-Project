const express = require("express");
const path = require('path');
const app = express();
const connection = require("./connection.js");

app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
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

app.get("/modules", (req, res)=> {
    let readSql = `SELECT * FROM modules ORDER BY LOWER(TRIM(module_title)) ASC`;

    connection.query(readSql, (err, rows)=>{
        if (err) throw err;
        res.render("modules", {modules : rows});

    });
        
});

app.get("/grades", (req, res)=> {
    res.render("grades");
})

app.post('/login', (req, res)=> {
    const {email, password} = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user){
        res.render('landing', {user});
    } else {
        res.render('index', {error: 'Invalid email or password'});
    }
})

app.post("/modules/update", (req, res)=> {
    const { module_id, module_title, credit_value, core_module} = req.body;
    const updateQuery = `
    UPDATE modules
    SET module_title = ?, credit_value = ?, core_module = ?
    WHERE module_id = ?`;

    connection.query(updateQuery, [module_title, credit_value, core_module, module_id], (err) => {
        if (err) throw err;
        res.redirect("/modules");
    });
})

app.listen(3002, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})