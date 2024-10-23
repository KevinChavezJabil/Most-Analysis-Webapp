const showNavbar = (toggleId, navId, bodyId, headerId) => {
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId),
        bodypd = document.getElementById(bodyId),
        headerpd = document.getElementById(headerId);

    const handleResize = () => {
        if (window.innerWidth >= 768) {
            // En pantallas grandes, la barra debe estar siempre visible sin animación desde el inicio.
            nav.classList.add('show');
            toggle.classList.add('hide');  // Ocultar el ícono del toggle en pantallas grandes.
            bodypd.classList.add('body-pd');
            headerpd.classList.add('body-pd');
        } else {
            // En pantallas pequeñas, permite abrir y cerrar con animación.
            nav.classList.remove('show');
            toggle.classList.remove('hide');  // Mostrar el ícono del toggle.
            bodypd.classList.remove('body-pd');
            headerpd.classList.remove('body-pd');
        }
    };

    // Llama la función al iniciar para ajustar la barra según el tamaño de la pantalla
    handleResize();

    // Escucha los cambios de tamaño de la ventana
    window.addEventListener('resize', handleResize);
};

// Mostrar barra desde el inicio (sin esperar animación) en pantallas grandes
document.addEventListener('DOMContentLoaded', () => {
    showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header');
});


/*===== LINK ACTIVE  =====*/ 
// Obtener todas las opciones de navegación
const linkColor = document.querySelectorAll('.nav__link');

// Función para marcar el enlace activo según la URL actual
const setActiveLink = () => {
    // Obtener la ruta actual de la URL (ejemplo: "/dashboard")
    const currentUrl = window.location.pathname;

    // Recorrer todos los enlaces de navegación
    linkColor.forEach(link => {
        // Comparar la ruta del enlace con la URL actual
        if (link.getAttribute('href') === currentUrl) {
            // Si coinciden, se agrega la clase "active" a ese enlace
            link.classList.add('active');
        } else {
            // Si no coinciden, se remueve la clase "active"
            link.classList.remove('active');
        }
    });
};

// Llamar a la función cuando la página cargue
setActiveLink();



// https://github.com/bedimcode/responsive-sidebar-menu/tree/master