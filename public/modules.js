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

    fetch('/modules/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        alert('Module updated successfully!');

        
        const index = form.dataset.index;  

        
        const subjCode = form.querySelector('input[name="subj_code"]').value;
        const moduleTitle = form.querySelector('input[name="module_title"]').value;
        const creditValue = form.querySelector('input[name="credit_value"]').value;
        const coreModule = form.querySelector('select[name="core_module"]').value;

       
        const row = document.getElementById(`module-row-${index}`);
        row.children[0].textContent = subjCode;
        row.children[1].textContent = moduleTitle;
        row.children[2].textContent = creditValue;
        row.children[3].textContent = coreModule;

        
        const formRow = document.getElementById(`edit-form-row-${index}`);
        formRow.style.display = 'none';
      } else {
        alert('Failed to update module.');
      }
    })
    .catch(error => {
      console.error('Error updating module:', error);
    });
  }
});

