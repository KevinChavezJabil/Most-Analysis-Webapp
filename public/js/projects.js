//getting all required data
const searchBar = document.querySelector(".search-bar");
const inputBox = document.querySelector("input");
const suggBox = document.querySelector(".autocom-box");
const clearBtn = document.querySelector(".delete-btn");

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
};

function select(element) {
    let selectUserData = element.textContent;
    inputBox.value = selectUserData; // Pasar los datos seleccionados al campo de texto
    searchBar.classList.remove("active");
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
