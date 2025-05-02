const dropdown = document.getElementById("studentDropdown");
const studentInput = document.getElementById("studentSearch");
const studentList = document.getElementById("studentList");
const selectedRecipients = new Map();

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

function selectStudent(studentId, studentName) {
    studentInput.value = studentName;
    dropdown.classList.remove("is-active");

    
}

window.selectStudent = function(studentId, studentName) {
    studentInput.value = studentName;
    dropdown.classList.remove("is-active");

    fetch(`/studentSummary/${studentId}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error("No data returned");

            
            const summaryHtml = `
                <table class="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Pathway</th>
                            <th>Total Credits</th>
                            <th>Average Grade</th>
                            <th>Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${data.summary.student_id}</td>
                            <td>${data.summary.name}</td>
                            <td>${data.summary.pathway}</td>
                            <td>${data.summary.total_credits}</td>
                            <td>${data.summary.average_grade}</td>
                            <td>${data.summary.decision}</td>
                        </tr>
                    </tbody>
                </table>
            `;
            document.getElementById("studentSummaryContainer").innerHTML = summaryHtml;
            let modulesHtml = `
                <table class="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Module Title</th>
                            <th>Module Code</th>
                            <th>Credit Value</th>
                            <th>First Grade</th>
                            <th>Grade Result</th>
                            <th>Resit Grade</th>
                            <th>Resit Result</th>
                            <th>Repeated Module</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.modules.map(mod => `
                            <tr>
                                <td>${mod.module_title}</td>
                                <td>${mod.module_code}</td>
                                <td>${mod.credit_value}</td>
                                <td>${mod.first_grade}</td>
                                <td>${mod.grade_result ? mod.grade_result.toUpperCase() : "N/A"}</td>
                                <td>${mod.resit_grade || 'N/A'}</td>
                                <td>${mod.resit_result ? mod.resit_result.toUpperCase() : "N/A"}</td>
                                <td>${mod.attempt_count > 1 ? "YES" : "NO"}</td>
                                
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
            document.getElementById("studentModulesContainer").innerHTML = modulesHtml;
        })
        .catch(err => {
            console.error("Error fetching student data:", err);
            document.getElementById("studentSummaryContainer").innerHTML = "<p>Error loading summary.</p>";
            document.getElementById("studentModulesContainer").innerHTML = "";
        });
};

