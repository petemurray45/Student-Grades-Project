const tableBody = document.getElementById('modulesTableBody'); 



function toggleEditForm(index) {
  const formRow = document.getElementById('edit-form-row-' + index);
  if (formRow.style.display === 'none') {
    formRow.style.display = 'table-row';
  } else {
    formRow.style.display = 'none';
  }
}


document.addEventListener('submit', function(e) {
  if (e.target && e.target.classList.contains('edit-module-form')) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch('/admin/modules/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        alert('Module updated successfully!');
        this.location.reload();
      } else {
        alert('Failed to update module.');
      }
    })
    .catch(error => {
      console.error('Error updating module:', error);
    });
  }
});


document.addEventListener('DOMContentLoaded', loadModules);