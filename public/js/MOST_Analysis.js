document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('mostTable').getElementsByTagName('tbody')[0];
    const addRowBtn = document.getElementById('addRowBtn');
    const saveBtn = document.getElementById('saveBtn');
    const addSheetBtn = document.getElementById('addSheetBtn');
    const notification = document.getElementById('notification');
    let isModified = false;

    addRowBtn.addEventListener('click', () => {
        const newRow = document.createElement('tr');

        for (let i = 0; i < 7; i++) {
            const newCell = document.createElement('td');
            if (i === 3) {
                // Component dropdown
                const select = document.createElement('select');
                select.classList.add('component-dropdown');
                components.forEach(component => {
                    const option = document.createElement('option');
                    option.value = component._id;
                    option.textContent = component.name;
                    select.appendChild(option);
                });
                newCell.appendChild(select);
            } else if (i === 4) {
                // Methods dropdown
                const methodsContainer = document.createElement('div');
                methodsContainer.classList.add('methods-container');
                const select = document.createElement('select');
                select.classList.add('method-dropdown');
                methods.forEach(method => {
                    const option = document.createElement('option');
                    option.value = method._id;
                    option.textContent = method.name;
                    select.appendChild(option);
                });
                methodsContainer.appendChild(select);
                const addButton = document.createElement('button');
                addButton.type = 'button';
                addButton.classList.add('add-method-btn');
                addButton.textContent = '+';
                methodsContainer.appendChild(addButton);
                newCell.appendChild(methodsContainer);
            } else {
                newCell.contentEditable = "true";
                newCell.textContent = "";
            }
            newRow.appendChild(newCell);
        }

        tableBody.appendChild(newRow);
        updateRowNumbers();
        isModified = true;
    });

    function updateRowNumbers() {
        const rows = tableBody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[0].textContent = i + 1;
        }
    }

    tableBody.addEventListener('input', () => {
        isModified = true;
    });

    tableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-method-btn')) {
            const methodsContainer = event.target.parentElement;
            const select = document.createElement('select');
            select.classList.add('method-dropdown');
            methods.forEach(method => {
                const option = document.createElement('option');
                option.value = method._id;
                option.textContent = method.name;
                select.appendChild(option);
            });
            methodsContainer.insertBefore(select, event.target);
            if (methodsContainer.getElementsByTagName('select').length >= 8) {
                event.target.style.display = 'none';
            }
        } else if (event.target.classList.contains('remove-method-btn')) {
            const methodsContainer = event.target.parentElement;
            methodsContainer.removeChild(event.target.previousElementSibling);
            methodsContainer.removeChild(event.target);
            const addButton = methodsContainer.querySelector('.add-method-btn');
            if (addButton) {
                addButton.style.display = 'inline-block';
            }
        }
    });

    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    async function saveChanges() {
        const projectId = window.location.pathname.split('/')[2];
        const sheetId = document.querySelector('.sheet-tab.active').dataset.sheetId;
        const rows = tableBody.getElementsByTagName('tr');
        const rowDataArray = [];
    
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const methods = Array.from(row.cells[4].getElementsByTagName('select')).map(select => select.value);
            const rowData = {
                'Part Number': row.cells[1].textContent,
                'Description': row.cells[2].textContent,
                'Component': row.cells[3].querySelector('select').value,
                'Methods': methods, // Enviar como array de strings
                'Quantity': row.cells[5].textContent,
                'Cycle Time': row.cells[6].textContent
            };
            console.log(`Fila ${i + 1}:`, rowData);
            rowDataArray.push(rowData);
        }
    
        console.log("Datos enviados al servidor:", rowDataArray);
    
        try {
            const response = await fetch(`/save-changes/${projectId}/${sheetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rowDataArray })
            });
    
            const result = await response.json();
            if (result.success) {
                showNotification("Changes saved successfully!");
                isModified = false;
            } else {
                alert("Error al guardar cambios");
            }
        } catch (error) {
            console.error('Error al guardar cambios:', error);
        }
    }

    saveBtn.addEventListener('click', saveChanges);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (isModified) {
            const confirmationMessage = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?";
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });

    function normalizeSheetName(sheetName) {
        return sheetName.toLowerCase().replace(/\s+/g, '_');
    }

    function switchSheet(sheetId) {
        const projectUrl = window.location.pathname.split('/')[2];
        window.location.href = `/MOST_Analysis/${projectUrl}/${sheetId}`;
    }        

    window.switchSheet = switchSheet;

    addSheetBtn.addEventListener('click', async () => {
        const newSheetName = prompt("Enter new sheet name:");
        if (newSheetName) {
            const projectUrl = window.location.pathname.split('/')[2];
            const response = await fetch('/add-sheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectUrl, newSheetName })
            });
    
            const result = await response.json();
            if (result.success) {
                window.location.href = `/MOST_Analysis/${projectUrl}/${result.sheetId}`;
            } else {
                alert(result.message || "Error adding sheet");
            }
        }
    });    
});