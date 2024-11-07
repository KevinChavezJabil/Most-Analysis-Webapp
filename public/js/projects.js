if (typeof document !== 'undefined') {
    //getting all required data
    const searchBar = document.querySelector(".search-bar");
    const inputBox = document.querySelector("input");
    const suggBox = document.querySelector(".autocom-box");
    const clearBtn = document.querySelector(".delete-btn");
    const projectButtons = document.getElementById("project-buttons");

    if(inputBox.value){
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }

    inputBox.onkeyup = (e) => {
        let userData = e.target.value;
        let array = [];
        if (userData) {
            clearBtn.style.display = "block"; // Mostrar el botón de borrar
            array = suggestions.filter((data) => {
                return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
            });
            array = array.map((data) => {
                return data = '<li>' + data + '</li>';
            });
            searchBar.classList.add("active"); // Mostrar el cuadro de autocompletar
            showSuggestions(array);
            let allList = suggBox.querySelectorAll("li");
            for (let i = 0; i < allList.length; i++) {
                allList[i].setAttribute("onclick", "select(this)");
            }
        } else {
            clearBtn.style.display = "none"; // Ocultar el botón de borrar
            searchBar.classList.remove("active"); // Ocultar el cuadro de autocompletar
        }
    };

    clearBtn.onclick = () => {
        inputBox.value = ""; // Limpiar el campo de entrada
        searchBar.classList.remove("active"); // Ocultar el cuadro de autocompletar
        clearBtn.style.display = "none"; // Ocultar el botón de borrar
        showAllProjects(); // Mostrar todos los proyectos
    };

    function select(element) {
        let selectUserData = element.textContent;
        inputBox.value = selectUserData; // Pasar los datos seleccionados al campo de texto
        searchBar.classList.remove("active");
        filterProjects(selectUserData); // Filtrar los proyectos
    }

    function showSuggestions(list) {
        let listData;
        if (!list.length) {
            userValue = inputBox.value;
            listData = '<li>' + userValue + '</li>';
        } else {
            listData = list.join('');
        }
        suggBox.innerHTML = listData;
    }

    function filterProjects(query) {
        const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(query.toLowerCase()));
        renderProjects(filteredProjects);
    }

    function showAllProjects() {
        renderProjects(projects);
    }

    function renderProjects(projectList) {
        projectButtons.innerHTML = '';
        if (projectList.length > 0) {
            projectList.forEach(project => {
                const button = document.createElement('button');
                button.className = 'dynamic-button';
                button.onclick = () => window.location.href = `/MOST_Analysis/${project.url}`;
                button.innerHTML = `
                    <img src="/img/buildings.jpg" alt="Project image">
                    <h3>${project.name}</h3>
                    <h4>${new Date(project.creationDate).toLocaleDateString('es-ES')}</h4>
                `;
                projectButtons.appendChild(button);
            });
        } else {
            projectButtons.innerHTML = '<p>No projects found.</p>';
        }
    }
}
