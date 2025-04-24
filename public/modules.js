

document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", ()=> {
        const module = JSON.parse(button.dataset.module);

        document.getElementById('module-id').value = module.module_id;
        document.getElementById('module-title').value = module.module_title;
        document.getElementById('credit-value').value = module.credit_value;
        document.getElementById('core-module').value = module.core_module;
        document.getElementById('editModuleModal').classList.add('is-active');
    })
})

function closeModuleModal(){
    document.getElementById("editModuleModal").classList.remove("is-active");
}

function submitModuleEdit(){
    const id = document.getElementById('module-id').value;
    const title = document.getElementById('module-title').value;
    const credits = document.getElementById('credit-value').value;
    const core = document.getElementById('core-module').value;

    fetch("admin/modules/update", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({id, title, credits, core})
    })
    .then(res => res.json())
    .then(()=> {
        closeModuleModal();
        location.reload();
    })
}