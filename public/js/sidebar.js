/*===== SHOW NAVBAR  =====*/ 
const showNavbar = (toggleId, navId, bodyId, headerId) => {
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId),
        bodypd = document.getElementById(bodyId),
        headerpd = document.getElementById(headerId);

    // Validate that all variables exist
    if (toggle && nav && bodypd && headerpd) {
        toggle.addEventListener('click', () => {
            // Toggle navbar
            nav.classList.toggle('show');
            // Add padding to body
            bodypd.classList.toggle('body-pd');
            // Add padding to header
            headerpd.classList.toggle('body-pd');

            // Save the state in localStorage
            if (nav.classList.contains('show')) {
                localStorage.setItem('navbarState', 'show');
            } else {
                localStorage.setItem('navbarState', 'hide');
            }
        });
    }
};

// Function to set the initial state of the navbar based on localStorage
const setInitialNavbarState = (navId, bodyId, headerId) => {
    const nav = document.getElementById(navId),
        bodypd = document.getElementById(bodyId),
        headerpd = document.getElementById(headerId);

    const navbarState = localStorage.getItem('navbarState');

    if (navbarState === 'show') {
        nav.classList.add('show');
        bodypd.classList.add('body-pd');
        headerpd.classList.add('body-pd');
    }
};

// Call the functions
showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header');
setInitialNavbarState('nav-bar', 'body-pd', 'header');

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