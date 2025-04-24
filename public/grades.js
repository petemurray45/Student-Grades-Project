const dropdown = document.getElementById("moduleDropdown");
const moduleInput = document.getElementById("moduleSearch");
const moduleList = document.getElementById("moduleList");
const gradesTableBody = document.getElementById("gradesTableBody");
// need to save module name and id globally
let selectedModuleId = null;
let selectedModuleName = "";
const selectedModule = new Map();

// js to show dropdown when type in box 

moduleInput.addEventListener("focus", ()=> {
    dropdown.classList.add("is-active");
});

document.addEventListener("click", function (e){
    if (!dropdown.contains(e.target)){
        dropdown.classList.remove("is-active");
    }
});

function filterDropdown(){
    const search = moduleInput.value.toLowerCase();
    const items = moduleList.querySelectorAll(".dropdown-item");

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? "block" : "none";
    });
}

function selectModule(id, name) {

    selectedModuleId = id;
    selectedModuleName = name;

    moduleInput.value = "";
    dropdown.classList.remove("is-active");

    fetch(`grades/module/${id}`)
    .then(res => res.json())
    .then(data => {
        gradesTableBody.innerHTML = "";

        if (data.length === 0){
            gradesTableBody.innerHTML = "<tr><td colspan='3'>No Students found</td></tr>";
            return;
        }

        const htmlRows = data.map(row => {

            return `<tr>
                <td>${row.sID}</td>
                <td>${row.name}</td>
                <td>${row.first_grade}</td>
                <td>${row.grade_result}</td>
                <td>${row.resit_grade ?? 'N/A'}</td>
                <td>${row.resit_result ?? 'N/A'}</td>
                <td>${row.semester}</td>
                <td>${row.academic_year}</td>
                <td>
                    <button class="edit-btn button is-small is-info" data-student='${JSON.stringify(row)}'>Edit</button>
                </td>
            </tr>`;
        });
        gradesTableBody.innerHTML = htmlRows.join("");
        
    })
    .catch(err => {
        console.error("Error fetching student grades:", err);
    })
}

document.addEventListener("click", function(e){
    if (e.target.classList.contains("edit-btn")){
        const student = JSON.parse(e.target.dataset.student);
        document.getElementById('editSID').value = student.sID;
        document.getElementById('editFirstGrade').value = student.first_grade;
        document.getElementById('editGradeResult').value = student.grade_result;
        document.getElementById('editResitGrade').value = student.resit_grade;
        document.getElementById('editResitResult').value = student.resit_result;
        document.getElementById('editModal').classList.add('is-active');
    }

    if (e.target.id === "closeModal" || e.target.classList.contains("modal-background")){
        document.getElementById("editModal").classList.remove("is-active");
    }
})

document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
  
    fetch('/grades/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      document.getElementById('editModal').classList.remove('is-active');
      selectModule(selectedModuleId, selectedModuleName ); 
    });
  });



