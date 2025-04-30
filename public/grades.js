const searchInput = document.getElementById("moduleSearch");
const dropDown = document.getElementById("moduleDropdown");
const dropdown = document.getElementById("moduleDropdown");
const moduleInput = document.getElementById("moduleSearch");
const moduleList = document.getElementById("moduleList");
const gradesTableBody = document.getElementById("gradesTableBody");

moduleInput.addEventListener("focus", ()=> {
    dropdown.classList.add("is-active");
});

document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('moduleDropdown');
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('is-active');
document.addEventListener("click", function (e){
    if (!dropdown.contains(e.target)){
        dropdown.classList.remove("is-active");
    }
  });
}});

searchInput.addEventListener("focus", ()=> dropDown.classList.add("is-active"));
function filterDropdown(){
    const search = moduleInput.value.toLowerCase();
    const items = moduleList.querySelectorAll(".dropdown-item");

}

searchInput.addEventListener('input', ()=> {
    const filter = searchInput.value.toLowerCase();
    document.querySelectorAll('.module-option').forEach(option => {
        option.style.display = option.textContent.toLowerCase().includes(filter) ? '' : 'none';
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? "block" : "none";
        });
    });
})


function selectModule(moduleId, moduleTitle) {
    document.getElementById('moduleSearch').value = moduleTitle;
  
    fetch(`/grades/module/${moduleId}`)
      .then(response => response.json())
      .then(data => {
        const gradesTableBody = document.getElementById('gradesTableBody');
        gradesTableBody.innerHTML = ''; 
  
        data.forEach((grade, index) => {
          
          const row = document.createElement('tr');
          row.setAttribute('data-student-id', grade.student_id);
          row.innerHTML = `
            <td>${grade.student_id}</td>
            <td>${grade.name}</td>
            <td>${grade.first_grade}</td>
            <td>${grade.grade_result}</td>
            <td>${grade.resit_grade !== null ? grade.resit_grade : 'N/A'}</td>
            <td>${grade.resit_result ? grade.resit_result.toUpperCase() : 'N/A'}</td>
            <td>${grade.semester}</td>
            <td>${grade.academic_year}</td>
            <td><button class="button" onclick="toggleGradeForm('${index}')">Edit</button></td>
          `;
          gradesTableBody.appendChild(row);
  
         
          const formRow = document.createElement('tr');
          formRow.id = `form-row-${index}`;
          formRow.style.display = 'none';
          formRow.innerHTML = `
            <td colspan="9">
              <form class="edit-grade-form">
                <input type="hidden" name="student_id" value="${grade.student_id}">
                <input type="hidden" name="module_id" value="${grade.module_id}">

  
                <div class="field">
                  <label class="label">First Grade</label>
                  <input class="input" type="number" name="first_grade" value="${grade.first_grade}">
                </div>
  
                <div class="field">
                  <label class="label">Grade Result</label>
                    <div class="control">
                        <div class="select">
                            <select name="grade_result">
                                <option value="PASS" ${grade.grade_result === 'PASS' ? 'selected' : ''}>PASS</option>
                                <option value="FAIL" ${grade.grade_result === 'FAIL' ? 'selected' : ''}>FAIL</option>
                                <option value="PASS CAPPED" ${grade.grade_result === 'PASS CAPPED' ? 'selected' : ''}>PASS CAPPED</option>
                                <option value="EXCUSED" ${grade.grade_result === 'EXCUSED' ? 'selected' : ''}>EXCUSED</option>
                            </select>
                        </div>
                    </div>
                </div>
  
                <div class="field">
                  <label class="label">Resit Grade</label>
                  <input class="input" type="number" name="resit_grade" value="${grade.resit_grade}">
                </div>
  
                <div class="field">
                    <label class="label">Resit Result</label>

                    <div class="control">
                        <div class="select">
                            <select name="resit_result">
                                <option value="N/A" ${grade.resit_result === 'N/A' ? 'selected' : ''}>N/A</option>
                                <option value="PASS" ${grade.resit_result === 'PASS' ? 'selected' : ''}>PASS</option>
                                <option value="FAIL" ${grade.resit_result === 'FAIL' ? 'selected' : ''}>FAIL</option>
                                <option value="PASS CAPPED" ${grade.resit_result === 'PASS CAPPED' ? 'selected' : ''}>PASS CAPPED</option>
                                <option value="EXCUSED" ${grade.resit_result === 'EXCUSED' ? 'selected' : ''}>EXCUSED</option>
                                <option value="ABSENT" ${grade.resit_result === 'ABSENT' ? 'selected' : ''}>ABSENT</option>
                            </select>
                        </div>
                    </div>
                </div>
  
                <div class="field">
                  <label class="label">Semester</label>
                  <input class="input" type="text" name="semester" value="${grade.semester}">
                </div>
  
                <div class="field">
                  <label class="label">Academic Year</label>
                  <input class="input" type="text" name="academic_year" value="${grade.academic_year}">
                </div>
  
                <button type="submit" class="button is-primary">Save</button>
              </form>
            </td>
          `;
          gradesTableBody.appendChild(formRow);
        });
    })
    .catch(error => {
    console.error('Error fetching module grades:', error);
    });
}

document.addEventListener('submit', function(e) {
    if (e.target && e.target.classList.contains('edit-grade-form')) {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      console.log("Form Data:", data); 
  
      fetch('/grades/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          alert('Grade updated successfully!');
  
          const row = document.querySelector(`tr[data-student-id="${data.student_id}"]`);
          if (row) {
            row.children[2].textContent = data.first_grade ?? 'N/A';
            row.children[3].textContent = data.grade_result ? data.grade_result.toUpperCase() : 'N/A';
            row.children[4].textContent = data.resit_grade ?? 'N/A';
            row.children[5].textContent = data.resit_result ? data.resit_result.toUpperCase() : 'N/A';
            row.children[6].textContent = data.semester ?? 'N/A';
            row.children[7].textContent = data.academic_year ?? 'N/A';
          }
  
          form.closest('tr').style.display = 'none'; 
        } else {
          alert('Failed to update grade.');
        }
      })
      .catch(error => {
        console.error('Error updating grade:', error);
        alert('Error updating grade.');
      });
    }
  });


function toggleGradeForm(index) {
    const formRow = document.getElementById('form-row-' + index);
    if (formRow.style.display === 'none') {
      formRow.style.display = 'table-row';
    } else {
      formRow.style.display = 'none';
    }
}

document.getElementById("csvUploadForm").addEventListener("submit", function(e){
  e.preventDefault();

  const formData = new FormData(this);

  fetch("/grades/upload", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    const resultBox = document.getElementById("uploadResult");
    resultBox.style.display = "block";
    resultBox.textContent = `Grades processed ${data.added} added, ${data.updated} updated.`;
  })
  .catch(err => {
    alert("Error uploading CSV");
    console.error(err);
  })
})