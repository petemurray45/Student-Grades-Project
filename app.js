const express = require("express");
const path = require('path');
const app = express();

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
    res.render("modules");
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

app.listen(3000, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})