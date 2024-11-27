document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signUpForm = document.getElementById('signUpForm');
  const toggleSignUp = document.getElementById('toggleSignUp');
  const toggleLogin = document.getElementById('toggleLogin');
  const loginBtn = document.getElementById('loginBtn');
  const signUpBtn = document.getElementById('signUpBtn');
  const firstNameInput = signUpForm.querySelector('#firstName');
  const lastNameInput = signUpForm.querySelector('#lastName');
  const emailInput = signUpForm.querySelector('#signUpEmail');
  const passwordInput = signUpForm.querySelector('#signUpPassword');

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

  // Validations for First Name and Last Name
  const validateName = (input, fieldName) => {
    const errorElement = input.nextElementSibling; // Assuming there's a placeholder span for errors
    const value = input.value.trim();
    errorElement.textContent = ''; // Clear previous errors

    if (!value) {
      errorElement.textContent = `${fieldName} is required.`;
      return false;
    }

    if (value.length > 50) {
      errorElement.textContent = `${fieldName} must be less than 50 characters.`;
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(value)) {
      errorElement.textContent = `${fieldName} must contain only letters and spaces.`;
      return false;
    }

    return true;
  };

  // Validate Email
  const validateEmail = async (input) => {
    const errorElement = input.nextElementSibling; // Assuming a span for errors exists
    const value = input.value.trim();
    errorElement.textContent = ''; // Clear previous errors

    if (!value) {
      errorElement.textContent = 'Email is required.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errorElement.textContent = 'Enter a valid email address.';
      return false;
    }

    // Check with the server if the email already exists
    const response = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value }),
    });

    const data = await response.json();
    if (!response.ok || data.exists) {
      errorElement.textContent = 'Email is already associated with an account.';
      return false;
    }

    return true;
  };

  // Validate Password
  const validatePassword = (input) => {
    const errorElement = input.nextElementSibling; // Assuming a span or div for error messages
    const value = input.value;
    const errors = [];

    // Clear previous errors
    errorElement.innerHTML = '';

    if (value.length < 8) {
      errors.push('Password must be at least 8 characters.');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(value)) {
      errors.push('Password must contain at least one number.');
    }

    // Display errors dynamically
    errors.forEach((error) => {
      const errorItem = document.createElement('div');
      errorItem.classList.add('error-message-item');
      errorItem.textContent = error;
      errorElement.appendChild(errorItem);
    });

    return errors.length === 0;
  };

  // Attach event listeners for real-time validation
  firstNameInput.addEventListener('input', () => validateName(firstNameInput, 'First Name'));
  lastNameInput.addEventListener('input', () => validateName(lastNameInput, 'Last Name'));
  emailInput.addEventListener('input', () => validateEmail(emailInput));
  passwordInput.addEventListener('input', () => validatePassword(passwordInput));

  // Validate on form submission
  signUpBtn.addEventListener('click', async (e) => {
    const isFirstNameValid = validateName(firstNameInput, 'First Name');
    const isLastNameValid = validateName(lastNameInput, 'Last Name');
    const isEmailValid = await validateEmail(emailInput);
    const isPasswordValid = validatePassword(passwordInput);

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPasswordValid) {
      e.preventDefault(); // Prevent form submission
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