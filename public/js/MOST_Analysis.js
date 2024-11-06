document.addEventListener("DOMContentLoaded", async () => {
    const methodDropdowns = document.querySelectorAll(".method-dropdown");
    const addMethodBtns = document.querySelectorAll(".add-method-btn");
    const removeMethodBtns = document.querySelectorAll(".remove-method-btn");

    let methods = [];

    try {
        const response = await fetch('/api/methods');
        methods = await response.json();

        // Llenar los dropdowns con los métodos
        methodDropdowns.forEach(dropdown => {
            methods.forEach(method => {
                const option = document.createElement("option");
                option.value = method.method;
                option.textContent = method.method;
                dropdown.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Error fetching methods:', err);
    }

    function updateCycleTime(row) {
        const dropdowns = row.querySelectorAll(".method-dropdown");
        const quantity = parseFloat(row.querySelector(".quantity-input").value) || 0;
        const cycleTimeElement = row.querySelector(".cycle-time");

        let totalStandardTime = 0;

        dropdowns.forEach(dropdown => {
            const method = dropdown.value;
            const selectedMethod = methods.find(m => m.method === method);
            const standardTime = selectedMethod ? selectedMethod.standard_time : 0;
            totalStandardTime += standardTime;
        });

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

    // Añadir eventos para actualizar el ciclo cuando se cambia el dropdown o la cantidad
    document.querySelectorAll(".method-dropdown").forEach(dropdown => {
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

            if (dropdowns.length > 2) {
                methodContainer.removeChild(dropdowns[dropdowns.length - 1]);
                const row = e.target.closest("tr");
                updateCycleTime(row);
            }
        });
    });
});
