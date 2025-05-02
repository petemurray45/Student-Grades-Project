const express = require("express");
const router = express.Router();
const connection = require("../../connection.js")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireStudentLogin } = require("../../middleware/auth");
router.use(requireStudentLogin); 

// check and make sure upload folder exists for storing images
const uploadDir = path.join(__dirname, "../../uploads/students");

// creates it if not
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    // set the destination folder where files will be saved
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
     // set the filename format using the user id got from current session
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const fileName = `student_${req.session.user.user_id}${ext}`; // adds extension to filename
    cb(null, fileName); // pass to multer
  },
});

// ensures that only jpg and png images accepted
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    cb(null, allowed.includes(file.mimetype)); 
};
const upload = multer({ storage, fileFilter });

router.get("/", async (req, res) => {
    const studentId = req.session.user?.student_id;

    if (!studentId) {
        return res.redirect("/login"); 
    }

    try {
        const [results] = await connection.promise().query(
            `SELECT sID AS student_id, first_name, last_name, pathway, academic_level
             FROM students WHERE sID = ?`, [studentId]
        );
        const student = results[0];

        // create custom email (used qub as an example)
        const email = `${student.first_name[0].toLowerCase()}${student.last_name.toLowerCase()}@qub.ac.uk`;

        res.render("student/account", { 
            student: { ...student, name: `${student.first_name} ${student.last_name}`, email } 
        });
    } catch (err) {
        console.error("Error fetching student account:", err);
        res.status(500).send("Something went wrong");
    }
})

router.post("/upload", upload.single("profileImage"), async (req, res) => {
    if (!req.file) return res.status(400).send("Invalid file type.");
  
    const studentId = req.session.user.user_id;
    const filePath = `/uploads/students/${req.file.filename}`;
  
    try {
      await connection.promise().query(
        "UPDATE users SET profile_image = ? WHERE student_id = ?",
        [filePath, studentId]
      );
      res.redirect("/student/account");
    } catch (err) {
      console.error("Failed to update profile image:", err);
      res.status(500).send("Internal server error.");
    }
});



module.exports = router;