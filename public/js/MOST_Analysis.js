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

    fetchMethods();

    addRowBtn.addEventListener('click', () => addRow('mostTable'));
    saveBtn.addEventListener('click', saveChanges);
    addSheetBtn.addEventListener('click', addSheet);
    tableBody.addEventListener('input', () => isModified = true);
    tableBody.addEventListener('click', handleTableClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    document.querySelectorAll('.component-dropdown, .method-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', (event) => {
            const rowId = event.target.closest('tr').id;
            updateCycleTime(rowId);
        });
    });

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
                newRow.id = `row-${Date.now()}`;
    
                const columns = [
                    { editable: false, content: '' },
                    { editable: true, content: '' },
                    { editable: true, content: '' },
                    { editable: false, content: createDropdown(components, 'component-dropdown') },
                    { editable: false, content: createMethodsContainer(methods) },
                    { editable: true, content: '' },
                    { editable: false, content: '<span class="cycle-time">0.00</span>' }
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
                cycleTimeCell.textContent = cycleTime.toFixed(2); 
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
        document.getElementById('totalCycleTime').textContent = totalCycleTime.toFixed(2) + 's'; 
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
        //logica para quitar metodos
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
                alert("Error saving changes");
            }
        } catch (error) {
            console.error('Error saving changes:', error);
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
            const confirmationMessage = "You have unsaved changes, are you sure you want to exit without saving?";
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    }

    async function addSheet() {
        try {
            const projectUrl = window.location.pathname.split('/')[2];
            const response = await fetch(`/add-sheet/${projectUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
            const result = await response.json();
            console.log('Hoja agregada:', result);

            alert(`Nueva hoja agregada: ${result.sheet.name}`);
    
            await fetchSheets(); 
        } catch (error) {
            console.error('Error adding sheet:', error);
            alert('No se pudo agregar la hoja.');
        }
    }
    
    async function fetchSheets() {
        const projectUrl = window.location.pathname.split('/')[2];
        try {
            const response = await fetch(`/get-sheets/${projectUrl}`);
            if (!response.ok) throw new Error('Error al obtener las hojas');
            const sheets = await response.json();
    
            // Aquí actualizas la interfaz con las hojas
            const sheetList = document.getElementById('sheetList');
            sheetList.innerHTML = ''; // Limpia la lista actual
            sheets.forEach(sheet => {
                const sheetItem = document.createElement('li');
                sheetItem.textContent = sheet.name;
                sheetList.appendChild(sheetItem);
            });
        } catch (error) {
            console.error('Error fetching sheets:', error);
        }
    }    
    
    function switchSheet(sheetId) {
        const projectUrl = window.location.pathname.split('/')[2];
        window.location.href = `/MOST_Analysis/${projectUrl}/${sheetId}`;
    }

    window.switchSheet = switchSheet;
});