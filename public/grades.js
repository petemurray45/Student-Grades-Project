// DOM selectors

const searchInput = document.getElementById("moduleSearch");
const dropDown = document.getElementById("moduleDropdown");
const moduleList = document.getElementById("moduleList");
const saveBtn = document.getElementById("submitGrades");

document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('moduleDropdown');
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('is-active');
    }
  });

searchInput.addEventListener("focus", ()=> dropDown.classList.add("is-active"));

searchInput.addEventListener('input', ()=> {
    const filter = searchInput.value.toLowerCase();
    document.querySelectorAll('.module-option').forEach(option => {
        option.style.display = option.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
});


document.querySelectorAll('.module-option').forEach(option => {
    option.addEventListener('click', (e)=> {
        e.preventDefault();
        const moduleId = option.dataset.id;
        searchInput.value = option.textContent;
        dropDown.classList.remove('is-active');

        fetch(`/grades/module/${moduleId}`)
            .then(res => res.json())
            .then(data => {
            const tbody = document.getElementById('gradesTableBody');
            tbody.innerHTML = '';
            if (!data.length) {
                tbody.innerHTML = `<tr><td colspan="3">No students found for this module.</td></tr>`;
                return;
              }
            data.forEach(row => {
                tbody.innerHTML += `
                <tr>
                <td>${row.student_id}</td>
                <td>${row.student.first_name}</td>
                <td>${row.student.last_name}</td>
                <td>
                <input type="number" class="input" value="${row.first_grade}"
                data-student-id="${row.student_id}
                data-module-id=${row.module_id}>
                </td>
                </tr>`
            });
            saveBtn.classList.remove("is-hidden");
        });
    });
});

saveBtn.addEventListener('click', ()=> {
    const inputs = document.querySelectorAll("#gradesTableBody input");
    const updates = Array.from(inputs).map(input => ({
        student_id: input.dataset.studentId,
        module_id: input.dataset.moduleId,
        first_grade: input.value
    }));

    fetch('/grades/update', {
        method: 'POST',
        headers: {'Content-Type': application/json},
        body: JSON.stringify({grades:updates})
    })
    .then(res => res.json())
    .then(msg => alert(msg.message));
});


// get the grades for the selected module