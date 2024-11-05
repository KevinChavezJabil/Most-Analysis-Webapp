document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signUpForm = document.getElementById('signUpForm');
  const toggleSignUp = document.getElementById('toggleSignUp');
  const toggleLogin = document.getElementById('toggleLogin');
  const loginBtn = document.getElementById('loginBtn');
  const signUpBtn = document.getElementById('signUpBtn');

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

  // Manejar el envío del formulario de login
  loginBtn.addEventListener('click', async () => {
    const email = loginForm.querySelector('#email').value;
    const password = loginForm.querySelector('#password').value;

    console.log('Login button clicked');
    console.log('Email:', email);
    console.log('Password:', password);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Response:', response);
    console.log('Data:', data);

    if (response.ok) {
      // Manejar login exitoso
      console.log('Login successful', data);
      // Redirigir a /home
      window.location.href = data.redirectUrl;
    } else {
      // Manejar error de login
      console.error('Login failed', data);
    }
  });

  // Manejar el envío del formulario de signup
  signUpBtn.addEventListener('click', async () => {
    const name = signUpForm.querySelector('#firstName').value + ' ' + signUpForm.querySelector('#lastName').value;
    const email = signUpForm.querySelector('#signUpEmail').value;
    const password = signUpForm.querySelector('#signUpPassword').value;

    console.log('Sign Up button clicked');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, username: email })
    });

    const data = await response.json();
    console.log('Response:', response);
    console.log('Data:', data);

    if (response.ok) {
      // Manejar signup exitoso
      console.log('Signup successful', data);
      // Redirigir o actualizar la interfaz según sea necesario
    } else {
      // Manejar error de signup
      console.error('Signup failed', data);
    }
  });
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
