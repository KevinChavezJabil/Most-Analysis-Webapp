document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signUpForm = document.getElementById('signUpForm');
  const toggleSignUp = document.getElementById('toggleSignUp');
  const toggleLogin = document.getElementById('toggleLogin');

  // Función para mostrar el formulario de Sign Up y ocultar el de Login
  toggleSignUp.addEventListener('click', () => {
      loginForm.style.display = 'none';
      signUpForm.style.display = 'grid';
  });

  // Función para mostrar el formulario de Login y ocultar el de Sign Up
  toggleLogin.addEventListener('click', () => {
      signUpForm.style.display = 'none';
      loginForm.style.display = 'grid';
  });

  // Mostrar/Ocultar contraseña en el formulario de Login
  showHiddenPassword('password', 'input-icon');  

  // Mostrar/Ocultar contraseña en el formulario de Sign Up
  showHiddenPassword('signUpPassword', 'signUpIcon');  
});

// Función para mostrar/ocultar contraseñas
const showHiddenPassword = (inputPassword, inputIcon) => {
    const input = document.getElementById(inputPassword),
          iconEye = document.getElementById(inputIcon);
  
    iconEye.addEventListener('click', () => {
      // Cambiar de password a texto
      if (input.type === 'password') {
        input.type = 'text'; // Cambiar a texto
        iconEye.classList.add('ri-eye-line');  // Agregar ícono de ojo abierto
        iconEye.classList.remove('ri-eye-off-line');  // Quitar ícono de ojo cerrado
      } else {
        input.type = 'password';  // Cambiar a contraseña
        iconEye.classList.remove('ri-eye-line');  // Quitar ícono de ojo abierto
        iconEye.classList.add('ri-eye-off-line');  // Agregar ícono de ojo cerrado
      }
    });
};
