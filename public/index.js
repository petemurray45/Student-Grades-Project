const toggle = document.getElementById("toggle");
const welcomeMessage = document.getElementById("welcome-message");
const panel = document.getElementById("login-box");
const roleInput = document.getElementById("role");
const toggletext = document.getElementById("toggle-text");
const userNameInput = document.getElementById("userNameInput");

toggle.addEventListener("change", ()=> {
    if (toggle.checked){
        // for admin view
        welcomeMessage.textContent = "Welcome Admin";
        toggletext.textContent = "Toggle for Student Login";
        panel.classList.remove("student-theme");
        panel.classList.add("admin-theme");
        roleInput.value ="admin";
        userNameInput.placeholder = "Email"
        
    } else {
        // student view 
        welcomeMessage.textContent = "Welcome Student";
        toggletext.textContent = "Toggle for Admin Login";
        panel.classList.remove("admin-theme");
        panel.classList.add("student-theme");
        roleInput.value ="student";
        userNameInput.placeholder = "Student ID"
        userNameInput.type = "Text";

    }
})