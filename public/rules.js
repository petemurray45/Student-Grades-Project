document.addEventListener("change", function(e){
    if (e.target && e.target.classList.contains("decision-select")) {
        const studentID = e.target.dataset.studentId;
        const academicYear = e.target.dataset.academicYear;
        const newDecision = e.target.value;

        console.log('Sending:', {
            student_id: studentID,
            academic_year: academicYear,
            decision: newDecision
          });

        fetch("/update-decision", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ student_id: studentID, academic_year: academicYear, decision: newDecision })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                alert("Progression Decision Updated");
            } else {
                alert("Failed to Update");
            }
        })
        .catch(err => {
            console.error("Update Error:", err);
            alert("Server Error");
        })
    }
});


function toggleEdit(index) {
    const row = document.getElementById(`edit-form-row-${index}`);
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}

