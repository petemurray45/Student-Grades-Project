const connection = require("./connection.js");
const bcrypt = require("bcrypt");

async function createUsersFromStudents(){

    // grab all student ids from the students table
    const sqlQuery = `SELECT sID from students`;

    connection.query(sqlQuery, async (err, results) => {
        if (err){
            console.error("Failed to get Student Id's", err);
            return;
        }

        for (const row of results){
            const studentID = row.sID;
            const username = studentID;
            const rawPassword = studentID.slice(-4)+"QUB";
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            const sqlQuery2 = `
            INSERT INTO users (username, password_hash, role, student_id)
            VALUES (?, ?, 'student', ?)
            ON DUPLICATE KEY UPDATE username = username`;

            connection.query(sqlQuery2, [username, hashedPassword, studentID], (err2) =>{
                if (err2){
                    console.error(`Could not insert user for ${studentID}: `, err2.message);
                } else {
                    console.log(`User created for student ID: ${studentID}`)
                }
            })
        }

        setTimeout(()=> {
            connection.end();
            console.log(`Finished creating users and closed DB connection`);
        }, 1000);
    })
}



createUsersFromStudents();

