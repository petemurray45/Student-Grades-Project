const express = require("express");
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {

    res.render("index");

})

app.get("/", (req, res) => {

    res.render("landing");
})

app.listen(3000, (err)=>{
    if(err) throw err;
    console.log("Server is listening");
})