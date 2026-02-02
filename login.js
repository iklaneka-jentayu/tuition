document.addEventListener('DOMContentLoaded', function() {
    // Toggle between login and signup forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    
    if (showSignup && showLogin) {
        showSignup.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        });
        
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    if (toggleSignupPassword) {
        toggleSignupPassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('signupPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Mock authentication
            // In a real application, this would be a server-side API call
            
            // Check if admin credentials
            if (email === 'admin@excellearn.com' && password === 'admin123') {
               
                showNotification('Admin login successful! Redirecting...', 'success');
                //window.location.href = 'admin.html';
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
                alert('return..');
                return;
            }
            
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('excellearn_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                showNotification('Login successful! Redirecting...', 'success');
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify({
                    email: user.email,
                    name: user.name,
                    role: user.role
                }));
                
                setTimeout(() => {
                    // Redirect to appropriate page based on role
                    if (user.role === 'admin') {
                        window.location.href = 'admin.html';
                        alert('return..admin');
                    } else {
                        // For demo, redirect to home
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showNotification('Invalid email or password', 'error');
            }
        });
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const password = document.getElementById('signupPassword').value;
            const userType = document.getElementById('userType').value;
            const terms = signupForm.querySelector('input[name="terms"]').checked;
            
            // Validation
            if (!name || !email || !phone || !password || !userType) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('Please agree to the terms and conditions', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('excellearn_users') || '[]');
            const existingUser = users.find(u => u.email === email);
            
            if (existingUser) {
                showNotification('An account with this email already exists', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                phone: phone,
                password: password, // In real app, this should be hashed
                role: userType,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('excellearn_users', JSON.stringify(users));
            
            // Also send to Google Sheets for record keeping
            sendUserToGoogleSheets(newUser);
            
            showNotification('Account created successfully! You can now login.', 'success');
            
            // Switch back to login form
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            
            // Clear form
            signupForm.reset();
        });
    }
    
    // Social login buttons
    document.querySelectorAll('.btn-social').forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Microsoft';
            showNotification(`${provider} login integration would be implemented here`, 'info');
        });
    });
    
    // Forgot password
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            const email = prompt('Please enter your email address to reset password:');
            
            if (email) {
                // In a real app, this would send a reset email
                showNotification(`Password reset instructions would be sent to ${email}`, 'info');
            }
        });
    }
    
    // Send user data to Google Sheets
    function sendUserToGoogleSheets(user) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwOBs2XIB1NryAYH9_QSexo6qmns0rcajp8RPyT2wleQDX7-Yj91QVj99uyIfc-ccQD/exec';
        
        const payload = {
            action: 'create_user',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt
            }
        };
        
        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            console.log('User data sent to Google Sheets');
        })
        .catch(error => {
            console.error('Error sending user data:', error);
        });
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            zIndex: '9999',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.3s ease'
        });
        
        // Set background color
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#4a6bff'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 15px;
            }
        `;
        document.head.appendChild(style);
        
        // Close button event
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        document.body.appendChild(notification);
    }
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        const user = JSON.parse(currentUser);
        showNotification(`Welcome back, ${user.name}! Redirecting...`, 'success');
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    }
});
