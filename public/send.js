const dropdown = document.getElementById("studentDropdown");
const studentInput = document.getElementById("studentSearch");
const studentList = document.getElementById("studentList");

// js to show dropdown when type in box 

studentInput.addEventListener("focus", ()=> {
    dropdown.classList.add("is-active");
});

document.addEventListener("click", function (e){
    if (!dropdown.contains(e.target)){
        dropdown.classList.remove("is-active");
    }
});

function filterDropdown(){
    const search = studentInput.value.toLowerCase();
    const items = studentList.querySelectorAll(".dropdown-item");

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? "block" : "none";
    });
}

function selectStudent(id, name) {
    studentInput.value = `${name} (${id})`;
    document.getElementById("recipientInput").value = id;
    dropdown.classList.remove("is-active");
}