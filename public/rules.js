function toggleEdit(index) {
    const row = document.getElementById(`edit-form-row-${index}`);
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}