const dropZone = document.getElementById('dropZone');
const fileInput = dropZone.querySelector('input');

// Abre el cuadro de selección de archivos al hacer clic en el drop zone
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Actualiza el texto del drop zone con el nombre del archivo seleccionado
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        dropZone.querySelector('p').textContent = fileInput.files[0].name;
    }
});

// Maneja el evento de arrastre sobre el drop zone
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

// Elimina la clase dragover cuando se sale del drop zone
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

// Maneja el evento de soltar un archivo en el drop zone
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        // Asigna el archivo al input y muestra el nombre del archivo
        fileInput.files = files; // Asegúrate de que esto sea compatible con tu navegador
        dropZone.querySelector('p').textContent = files[0].name;
    }
    dropZone.classList.remove('dragover');
});

// Evitar que el cuadro de diálogo se abra dos veces
dropZone.addEventListener('mousedown', (e) => {
    // Evita que se dispare el click si se está arrastrando un archivo
    if (e.detail === 1) { // Solo abrir si es un clic simple
        fileInput.click();
    }
});