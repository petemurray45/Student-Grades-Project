function toggleForm(index){
    const row = document.getElementById(`form-row-${index}`);
    row.style.display = row.style.display === "none" ? "table-row" : "none";
}