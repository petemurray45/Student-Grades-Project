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

// MODULES Page

app.get("/modules", (req, res)=> {
    let readSql = `SELECT * FROM modules ORDER BY LOWER(TRIM(module_title)) ASC`;

    connection.query(readSql, (err, rows)=>{
        if (err) throw err;
        res.render("modules", {modules : rows});

    });
        
});

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



// GRADES PAGE


app.get("/grades", async (req, res) => {
    const [rows] = await connection.query("SELECT * FROM modules ORDER BY module_title ASC");
    res.render("grades", {modules:rows});
})

app.get("/grades/module/:id", (req, res)=>{
    const moduleId = req.params.id;

    console.log("Module ID received:", moduleId);
    const readSql =` SELECT *
        FROM grades
        WHERE module_id = ?`;

    connection.query(readSql, [moduleId], (err, rows)=> {
        if (err) {
            console.error("QUERY ERROR:", err);
            return res.status(500).send("Database error");
        }
        console.log("Returning rows:", rows);
        res.json(rows);
    })
})

app.post("/grades/update", async (req, res)=>{
    const updates = req.body.grades;

    for (const entry of updates){
        await connection.query(`
            UPDATE grades
            SET first_grade = ?
            WHERE student_id = ? AND module_id = ?`,
            [entry.first_grade, entry.student_id, entry.module_id]);
    };
    res.json({message : 'Grades updates successfully'})
});

// SEARCH page 

app.get("/search", (req, res)=> {
    let readSql1 = `SELECT * FROM students ORDER BY last_name ASC`;

    connection.query(readSql1, (err, rows)=> {
        if (err) throw err;
        res.render("search", {students : rows});
    })
})

app.get("/searchAddNew", (req, res)=> {
    res.render("searchAddNew");
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


app.listen(3001, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})