let methods = [];
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#mostTable tbody');
    const addRowBtn = document.getElementById('addRowBtn');
    const saveBtn = document.getElementById('saveBtn');
    const addSheetBtn = document.getElementById('addSheetBtn');
    const notification = document.getElementById('notification');
    let isModified = false;

    let methods = [];

    async function fetchMethods() {
        try {
            const response = await fetch('/get-components-and-methods');
            const data = await response.json();
            methods = data.methods;
        } catch (error) {
            console.error('Error fetching methods:', error);
        }
    }

    // Llama a fetchMethods al cargar la página
    fetchMethods();

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

    // Agregar eventos input a las celdas de cantidad
    document.querySelectorAll('td:nth-child(6)').forEach(cell => {
        cell.addEventListener('input', (event) => {
            const rowId = event.target.closest('tr').id;
            updateCycleTime(rowId);
        });
    });

    function addRow(tableId) {
        fetch('/get-components-and-methods')
            .then(response => response.json())
            .then(data => {
                const components = data.components;
                const methods = data.methods;    
                const tableBody = document.querySelector(`#${tableId} tbody`);
                const newRow = document.createElement('tr');
                newRow.id = `row-${Date.now()}`; // Asigna un ID único a la fila
    
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

                // Agregar eventos input a las celdas de cantidad
                newRow.querySelectorAll('td:nth-child(6)').forEach(cell => {
                    cell.addEventListener('input', (event) => {
                        const rowId = event.target.closest('tr').id;
                        updateCycleTime(rowId);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching components and methods:', error);
            });
    }

    function updateRowNumbers(tableId) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }

    function updateCycleTime(rowId) {
        const row = document.getElementById(rowId);
        if (!row) {
            console.error(`Row with ID ${rowId} not found`);
            return;
        }

        const componentId = row.querySelector('.component-dropdown').value;
        const methodIds = Array.from(row.querySelectorAll('.method-dropdown')).map(select => select.value);
        const quantityCell = row.querySelector('td:nth-child(6)');
        const quantity = parseFloat(quantityCell.textContent) || 0; // Trata el contenido vacío como 0

        // Si algún campo está vacío, el tiempo de ciclo se queda en 0
        if (!componentId || methodIds.includes('') || quantity <= 0) {
            row.querySelector('.cycle-time').textContent = '0.00';
            updateTotalCycleTime();
            return;
        }

        // Realizar el cálculo si los campos están completos
        fetch(`/api/get-cycle-time?componentId=${componentId}&methodIds=${methodIds.join(',')}`)
            .then(response => response.json())
            .then(data => {
                const cycleTimeCell = row.querySelector('.cycle-time');
                const cycleTime = parseFloat(data.cycleTime) * quantity; // Multiplicar por la cantidad
                cycleTimeCell.textContent = cycleTime.toFixed(2); // Redondear a 2 decimales
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
            totalCycleTime += parseFloat(row.querySelector('.cycle-time').textContent) || 0;
        });
        document.getElementById('totalCycleTime').textContent = totalCycleTime.toFixed(2); // Redondear a 2 decimales
    }

    function calculateRowCycleTime(rowId) {
        const row = document.getElementById(rowId);
        const cycleTimeCells = row.querySelectorAll('.cycle-time');
        return Array.from(cycleTimeCells).reduce((total, cell) => total + parseFloat(cell.textContent), 0);
    }

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
    
        // Crear un nuevo dropdown para métodos
        const select = document.createElement('select');
        select.classList.add('method-dropdown');
    
        // Obtener las opciones desde el backend
        fetch('/get-components-and-methods')
            .then(response => response.json())
            .then(data => {
                const methods = data.methods;    
                methods.forEach(method => {
                    const option = document.createElement('option');
                    option.value = method._id;
                    option.textContent = method.method;
                    select.appendChild(option);
                });
    
                methodsContainer.insertBefore(select, button);
    
                // Mostrar máximo 8 dropdowns
                if (methodsContainer.getElementsByTagName('select').length >= 8) {
                    button.style.display = 'none';
                }
    
                // Agregar evento para actualizar ciclo
                select.addEventListener('change', (event) => {
                    const rowId = event.target.closest('tr').id;
                    updateCycleTime(rowId);
                });
            })
            .catch(error => {
                console.error('Error fetching methods:', error);
            });
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