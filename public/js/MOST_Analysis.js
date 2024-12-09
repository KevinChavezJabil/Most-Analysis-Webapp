document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#mostTable tbody');
    const addRowBtn = document.getElementById('addRowBtn');
    const saveBtn = document.getElementById('saveBtn');
    const addSheetBtn = document.getElementById('addSheetBtn');
    const notification = document.getElementById('notification');
    let isModified = false;

    addRowBtn.addEventListener('click', () => addRow('mostTable'));
    saveBtn.addEventListener('click', saveChanges);
    addSheetBtn.addEventListener('click', addSheet);
    tableBody.addEventListener('input', () => isModified = true);
    tableBody.addEventListener('click', handleTableClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Agregar eventos change a los dropdowns existentes
    document.querySelectorAll('.component-dropdown, .method-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', (event) => {
            const rowId = event.target.closest('tr').id;
            updateCycleTime(rowId);
        });
    });

    // Función para agregar una fila a la tabla con las columnas predeterminadas
    function addRow(tableId) {
        fetch('/get-components-and-methods')
            .then(response => response.json())
            .then(data => {
                const components = data.components;
                const methods = data.methods;    
                const tableBody = document.querySelector(`#${tableId} tbody`);
                const newRow = document.createElement('tr');
                const columns = [
                    { editable: false, content: '' },
                    { editable: true, content: '' },
                    { editable: true, content: '' },
                    { editable: false, content: createDropdown(components, 'component-dropdown') },
                    { editable: false, content: createMethodsContainer(methods) },
                    { editable: true, content: '' },
                    { editable: false, content: '<span class="cycle-time">0</span>' }
                ];
                columns.forEach((col, index) => {
                    const newCell = document.createElement('td');
                    if (col.editable) {
                        newCell.contentEditable = "true";
                        newCell.textContent = col.content;
                    } else {
                        newCell.innerHTML = col.content;
                    }
                    newRow.appendChild(newCell);
                });
                tableBody.appendChild(newRow);
                updateRowNumbers(tableId);
                isModified = true;

                // Agregar eventos change a los nuevos dropdowns
                newRow.querySelectorAll('.component-dropdown, .method-dropdown').forEach(dropdown => {
                    dropdown.addEventListener('change', (event) => {
                        const rowId = event.target.closest('tr').id;
                        updateCycleTime(rowId);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching components and methods:', error);
            });
    }

    // Función para actualizar la numeración de las filas
    function updateRowNumbers(tableId) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }

    // Función para eliminar una fila específica y reenumerar las filas
    function deleteRow(tableId, rowIndex) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const rows = tableBody.getElementsByTagName('tr');
        if (rowIndex >= 0 && rowIndex < rows.length) {
            tableBody.removeChild(rows[rowIndex]);
            updateRowNumbers(tableId);
            isModified = true;
        }
    }

    // Función para cargar opciones en los dropdowns
    function loadDropdownOptions(columnType, keywords) {
        const options = columnType === 'Component' ? window.components : window.methods;
        return options.filter(option => keywords.some(keyword => option.name.includes(keyword)));
    }

    function updateCycleTime(rowId) {
        const row = document.getElementById(rowId);
        const componentId = row.querySelector('.component-dropdown').value;
        const methodIds = Array.from(row.querySelectorAll('.method-dropdown')).map(select => select.value);
    
        fetch(`/api/get-cycle-time?componentId=${componentId}&methodIds=${methodIds.join(',')}`)
            .then(response => response.json())
            .then(data => {
                const cycleTimeCell = row.querySelector('.cycle-time');
                cycleTimeCell.textContent = data.cycleTime;
                updateTotalCycleTime();
            })
            .catch(error => {
                console.error('Error fetching cycle time:', error);
            });
    }
    
    function updateTotalCycleTime() {
        const tableBody = document.querySelector('#mostTable tbody');
        const rows = tableBody.getElementsByTagName('tr');
        let totalCycleTime = 0;
        Array.from(rows).forEach(row => {
            totalCycleTime += parseFloat(row.querySelector('.cycle-time').textContent);
        });
        document.getElementById('totalCycleTime').textContent = totalCycleTime;
    }

    // Función para calcular el tiempo de ciclo de una fila
    function calculateRowCycleTime(rowId) {
        const row = document.getElementById(rowId);
        const cycleTimeCells = row.querySelectorAll('.cycle-time');
        return Array.from(cycleTimeCells).reduce((total, cell) => total + parseFloat(cell.textContent), 0);
    }

    // Función para calcular el tiempo de ciclo de toda la tabla
    function calculateTableCycleTime(tableId) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const rows = tableBody.getElementsByTagName('tr');
        return Array.from(rows).reduce((total, row) => total + calculateRowCycleTime(row.id), 0);
    }

    function createDropdown(options, className) {
        const select = document.createElement('select');
        select.classList.add(className);
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option._id;
            opt.textContent = option.component || option.method;
            select.appendChild(opt);
        });
        return select.outerHTML;
    }

    function createMethodsContainer(methods) {
        const methodsContainer = document.createElement('div');
        methodsContainer.classList.add('methods-container');
        methodsContainer.innerHTML = createDropdown(methods, 'method-dropdown') + 
                                     '<button type="button" class="add-method-btn">+</button>';
        return methodsContainer.outerHTML;
    }

    function handleTableClick(event) {
        if (event.target.classList.contains('add-method-btn')) {
            addMethod(event.target);
        } else if (event.target.classList.contains('remove-method-btn')) {
            removeMethod(event.target);
        }
    }

    function addMethod(button) {
        const methodsContainer = button.parentElement;
        const select = document.createElement('select');
        select.classList.add('method-dropdown');
        methods.forEach(method => {
            const option = document.createElement('option');
            option.value = method._id;
            option.textContent = method.method;
            select.appendChild(option);
        });
        methodsContainer.insertBefore(select, button);
        if (methodsContainer.getElementsByTagName('select').length >= 8) {
            button.style.display = 'none';
        }
    }

    function removeMethod(button) {
        const methodsContainer = button.parentElement;
        methodsContainer.removeChild(button.previousElementSibling);
        methodsContainer.removeChild(button);
        const addButton = methodsContainer.querySelector('.add-method-btn');
        if (addButton) {
            addButton.style.display = 'inline-block';
        }
    }

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
        const rowDataArray = Array.from(rows).map(row => ({
            'Part Number': row.cells[1].textContent,
            'Description': row.cells[2].textContent,
            'Component': row.cells[3].querySelector('select').value,
            'Methods': Array.from(row.cells[4].getElementsByTagName('select')).map(select => select.value),
            'Quantity': row.cells[5].textContent,
            'Cycle Time': row.cells[6].textContent
        }));

        try {
            const response = await fetch(`/save-changes/${projectId}/${sheetId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    function handleKeyDown(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
    }

    function handleBeforeUnload(e) {
        if (isModified) {
            const confirmationMessage = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?";
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    }

    async function fetchMethods() {
        try {
            const response = await fetch('/get-methods');
            const methods = await response.json();
            return methods;
        } catch (error) {
            console.error('Error fetching methods:', error);
            return [];
        }
    }

    async function addSheet() {
        const newSheetName = prompt("Enter new sheet name:");
        if (newSheetName) {
            const projectUrl = window.location.pathname.split('/')[2];
            const methods = await fetchMethods(); // Obtener métodos desde el backend
    
            try {
                const response = await fetch('/add-sheet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectUrl, newSheetName, methods })
                });
    
                const result = await response.json();
                if (result.success) {
                    window.location.href = `/MOST_Analysis/${projectUrl}/${result.sheetId}`;
                } else {
                    alert(result.message || "Error adding sheet");
                }
            } catch (error) {
                console.error('Error adding sheet:', error);
            }
        }
    }

    function switchSheet(sheetId) {
        const projectUrl = window.location.pathname.split('/')[2];
        window.location.href = `/MOST_Analysis/${projectUrl}/${sheetId}`;
    }

    window.switchSheet = switchSheet;
});