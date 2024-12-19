function editField(field) {
    const inputField = document.getElementById(field);
    inputField.removeAttribute('readonly');
    inputField.focus();
    inputField.select(); // Selecciona automáticamente el texto

    inputField.addEventListener('blur', () => {
        inputField.setAttribute('readonly', true);
        if (validateField(field, inputField.value)) {
            updateField(field, inputField.value);
        }
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            inputField.setAttribute('readonly', true);
            if (validateField(field, inputField.value)) {
                updateField(field, inputField.value);
            }
        }
    });

    inputField.addEventListener('input', () => {
        validateField(field, inputField.value);
    });
}

function validateField(field, value) {
    let isValid = true;
    const errorElement = document.getElementById(`${field}-error`);
    errorElement.textContent = '';

    switch (field) {
        case 'name':
        case 'lastName':
            if (!value) {
                errorElement.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
                isValid = false;
            } else if (value.length > 50) {
                errorElement.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than 50 characters.`;
                isValid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                errorElement.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} must contain only letters and spaces.`;
                isValid = false;
            }
            break;
        case 'email':
            if (!value) {
                errorElement.textContent = 'Email is required.';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorElement.textContent = 'Enter a valid email address.';
                isValid = false;
            }
            break;
        case 'password':
            const errors = [];
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
            if (value === document.getElementById('password').defaultValue) {
                errors.push('New password must be different from the old password.');
            }
            errorElement.innerHTML = errors.join('<br>');
            isValid = errors.length === 0;
            break;
    }

    return isValid;
}

function updateField(field, value) {
    fetch(`/settings/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field, value })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Update successful');
        } else {
            alert('Update failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });
}