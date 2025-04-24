const dropdown = document.getElementById("moduleDropdown");
const moduleInput = document.getElementById("moduleSearch");
const moduleList = document.getElementById("moduleList");
const gradesTableBody = document.getElementById("gradesTableBody");
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
            </tr>`;
        });
        gradesTableBody.innerHTML = htmlRows.join("");
        
    })
    .catch(err => {
        console.error("Error fetching student grades:", err);
    })
}



