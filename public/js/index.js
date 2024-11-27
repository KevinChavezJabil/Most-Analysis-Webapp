document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signUpForm = document.getElementById('signUpForm');
  const toggleSignUp = document.getElementById('toggleSignUp');
  const toggleLogin = document.getElementById('toggleLogin');
  const loginBtn = document.getElementById('loginBtn');
  const signUpBtn = document.getElementById('signUpBtn');

  toggleSignUp.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signUpForm.style.display = 'grid';
  });

  toggleLogin.addEventListener('click', () => {
    signUpForm.style.display = 'none';
    loginForm.style.display = 'grid';
  });

  showHiddenPassword('password', 'input-icon');
  showHiddenPassword('signUpPassword', 'signUpIcon');

  loginBtn.addEventListener('click', async () => {
    const email = loginForm.querySelector('#email').value;
    const password = loginForm.querySelector('#password').value;

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = data.redirectUrl;
    } else {
      console.error('Login failed', data);
    }
  });

  signUpBtn.addEventListener('click', async () => {
    const first_name = signUpForm.querySelector('#firstName').value;
    const last_name = signUpForm.querySelector('#lastName').value;
    const email = signUpForm.querySelector('#signUpEmail').value;
    const password = signUpForm.querySelector('#signUpPassword').value;

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ first_name, last_name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = data.redirectUrl;
    } else {
      console.error('Signup failed', data);
    }
  });
});

const showHiddenPassword = (inputPassword, inputIcon) => {
  const input = document.getElementById(inputPassword),
        iconEye = document.getElementById(inputIcon);

  iconEye.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      iconEye.classList.add('ri-eye-line');
      iconEye.classList.remove('ri-eye-off-line');
    } else {
      input.type = 'password';
      iconEye.classList.remove('ri-eye-line');
      iconEye.classList.add('ri-eye-off-line');
    }
  });
};