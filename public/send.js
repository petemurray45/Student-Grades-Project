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

function selectStudent(id, name) {

    if (selectedRecipients.has(id)) return;
    
    selectedRecipients.set(id, name);
    updateRecipient();
    updateRecipientInput();

    studentInput.value = "";
    dropdown.classList.remove("is-active");
}

function updateRecipient(){
    const recipientContainer = document.getElementById("recipientTags");
    recipientContainer.innerHTML = "";

    selectedRecipients.forEach((name, id) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = `${name} (${id})`;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete is-small";
        deleteBtn.onclick = () => {
            selectedRecipients.delete(id);
            updateRecipient();
            updateRecipientInput();
        }
        tag.appendChild(deleteBtn);
        recipientContainer.appendChild(tag);
    })
}

function validateForm() {
    updateRecipientInput(); 
    const hiddenInput = document.getElementById("recipientIdsInput");
    if (!hiddenInput.value) {
        alert("Please select at least one recipient.");
        return false;
    }
    return true;
}

function updateRecipientInput(){
    const hiddenInput = document.getElementById("recipientIdsInput");
    hiddenInput.value = Array.from(selectedRecipients.keys()).join(",");
}