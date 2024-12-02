document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('mostTable').getElementsByTagName('tbody')[0];
    const addRowBtn = document.getElementById('addRowBtn');
    const saveBtn = document.getElementById('saveBtn');
    const addSheetBtn = document.getElementById('addSheetBtn');
    const notification = document.getElementById('notification');
    let isModified = false;

    // Agregar fila nueva
    addRowBtn.addEventListener('click', () => {
        const newRow = document.createElement('tr');

        for (let i = 0; i < 7; i++) {
            const newCell = document.createElement('td');
            newCell.contentEditable = "true";
            newCell.textContent = "";
            newRow.appendChild(newCell);
        }

        tableBody.appendChild(newRow);
        updateRowNumbers();
        isModified = true;
    });

    // Actualizar números de fila
    function updateRowNumbers() {
        const rows = tableBody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[0].textContent = i + 1;
        }
    }

    // Guardar datos al cambiar
    tableBody.addEventListener('input', () => {
        isModified = true;
    });

    // Función para mostrar la notificación
    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    // Función para guardar cambios
    async function saveChanges() {
        const projectId = window.location.pathname.split('/').pop();
        const sheetName = document.querySelector('.sheet-tab.active').textContent;
        const rows = tableBody.getElementsByTagName('tr');
        const rowDataArray = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowData = {
                'Part Number': row.cells[1].textContent,
                'Description': row.cells[2].textContent,
                'Component': row.cells[3].textContent,
                'Methods': row.cells[4].textContent,
                'Quantity': row.cells[5].textContent,
                'Cycle Time': row.cells[6].textContent
            };
            rowDataArray.push(rowData);
        }

        try {
            const response = await fetch(`/save-changes/${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sheetName, rowDataArray })
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

    // Evento para el botón de guardar
    saveBtn.addEventListener('click', saveChanges);

    // Evento para Ctrl + S
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
    });

    // Advertencia al cerrar o cambiar de proyecto
    window.addEventListener('beforeunload', (e) => {
        if (isModified) {
            const confirmationMessage = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?";
            e.returnValue = confirmationMessage; // Estándar para la mayoría de los navegadores
            return confirmationMessage; // Para algunos navegadores
        }
    });

    // Agregar nueva hoja
    addSheetBtn.addEventListener('click', async () => {
        const newSheetName = prompt("Enter new sheet name:");
        if (newSheetName) {
            const projectUrl = window.location.pathname.split('/').pop();
            const response = await fetch('/add-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ projectUrl, newSheetName })
            });

            const result = await response.json();
            if (result.success) {
                location.reload();
            } else {
                alert("Error adding sheet");
            }
        }
    });

    // Cambiar entre hojas
    window.switchSheet = (sheetIndex) => {
        const projectUrl = window.location.pathname.split('/').pop();
        window.location.href = `/MOST_Analysis/${projectUrl}?sheetIndex=${sheetIndex}`;
    };
});