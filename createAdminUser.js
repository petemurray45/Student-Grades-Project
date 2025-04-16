
const connection = require("./connection.js");
const bcrypt = require("bcrypt");
const password = "QUB2025";
const username = "adminQueens";

function createAdminUser(){


bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log("Hashed Password:", hash);

    const sql = `INSERT INTO users 
    (username, password_hash, role, student_id) WHERE
    VALUES (?, ?, 'admin', NULL)`;

    connection.query(sql, [username, hash], (err2) => {
        if (err2){
            console.error("Could not create admin:", err2.message);
        } else {
            console.log("Admin created.")
        }
        connection.end();
    })
})


} 

createAdminUser();

