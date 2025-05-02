function toggleForm(index){
    const row = document.getElementById(`form-row-${index}`);
    row.style.display = row.style.display === "none" ? "table-row" : "none";
}

document.getElementById('add-student-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/admin/search/addStudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('Student added successfully!');
      this.reset();
    } else {
      alert('Failed to add student.');
    }
  });