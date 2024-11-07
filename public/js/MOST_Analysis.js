document.addEventListener("DOMContentLoaded", async () => {
    const methodDropdowns = document.querySelectorAll(".method-dropdown");
    const componentDropdowns = document.querySelectorAll(".component-dropdown");
    const addMethodBtns = document.querySelectorAll(".add-method-btn");
    const removeMethodBtns = document.querySelectorAll(".remove-method-btn");

    let methods = [];
    let components = [];

    try {
        const response = await fetch('/api/methods');
        const data = await response.json();
        methods = data.methods;
        components = data.components;

        // Llenar los dropdowns de métodos
        methodDropdowns.forEach(dropdown => {
            methods.forEach(method => {
                const option = document.createElement("option");
                option.value = method.method;
                option.textContent = method.method;
                dropdown.appendChild(option);
            });
        });

        // Llenar los dropdowns de componentes
        componentDropdowns.forEach(dropdown => {
            components.forEach(component => {
                const option = document.createElement("option");
                option.value = component.component;
                option.textContent = component.component;
                dropdown.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Error fetching methods and components:', err);
    }

    // Función para actualizar el ciclo con método y componente seleccionados
    function updateCycleTime(row) {
        const dropdowns = row.querySelectorAll(".method-dropdown");
        const componentDropdown = row.querySelector(".component-dropdown");
        const quantity = parseFloat(row.querySelector(".quantity-input").value) || 0;
        const cycleTimeElement = row.querySelector(".cycle-time");

        let totalStandardTime = 0;

        // Sumar tiempos de métodos seleccionados
        dropdowns.forEach(dropdown => {
            const method = dropdown.value;
            const selectedMethod = methods.find(m => m.method === method);
            const standardTime = selectedMethod ? selectedMethod.standard_time : 0;
            totalStandardTime += standardTime;
        });

        // Sumar tiempo del componente seleccionado
        const selectedComponent = components.find(c => c.component === componentDropdown.value);
        const componentTime = selectedComponent ? selectedComponent.standard_time : 0;
        totalStandardTime += componentTime;

        const cycleTime = totalStandardTime * quantity;
        cycleTimeElement.textContent = cycleTime.toFixed(2);
        updateTotalCycleTime();
    }

    function updateTotalCycleTime() {
        const cycleTimeElements = document.querySelectorAll(".cycle-time");
        let totalCycleTime = 0;

        cycleTimeElements.forEach(element => {
            totalCycleTime += parseFloat(element.textContent) || 0;
        });

        document.getElementById("totalCycleTime").textContent = totalCycleTime.toFixed(2);
    }

    // Eventos para actualizar el ciclo al cambiar el método o la cantidad
    document.querySelectorAll(".method-dropdown").forEach(dropdown => {
        dropdown.addEventListener("change", (e) => {
            const row = e.target.closest("tr");
            updateCycleTime(row);
        });
    });

    document.querySelectorAll(".component-dropdown").forEach(dropdown => {
        dropdown.addEventListener("change", (e) => {
            const row = e.target.closest("tr");
            updateCycleTime(row);
        });
    });

    document.querySelectorAll(".quantity-input").forEach(input => {
        input.addEventListener("input", (e) => {
            const row = e.target.closest("tr");
            updateCycleTime(row);
        });
    });

    // Añadir eventos para agregar más dropdowns
    addMethodBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const methodContainer = e.target.closest(".method-container");
            const dropdowns = methodContainer.querySelectorAll(".method-dropdown");

            if (dropdowns.length < 7) {
                const newDropdown = document.createElement("select");
                newDropdown.classList.add("method-dropdown");

                methods.forEach(method => {
                    const option = document.createElement("option");
                    option.value = method.method;
                    option.textContent = method.method;
                    newDropdown.appendChild(option);
                });

                methodContainer.insertBefore(newDropdown, btn);

                // Añadir evento al nuevo dropdown
                newDropdown.addEventListener("change", (e) => {
                    const row = e.target.closest("tr");
                    updateCycleTime(row);
                });
            }
        });
    });

    // Añadir eventos para eliminar dropdowns
    removeMethodBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const methodContainer = e.target.closest(".method-container");
            const dropdowns = methodContainer.querySelectorAll(".method-dropdown");

            if (dropdowns.length > 1) {
                methodContainer.removeChild(dropdowns[dropdowns.length - 1]);
                const row = e.target.closest("tr");
                updateCycleTime(row);
            }
        });
    });
});
