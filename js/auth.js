// Authentication functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'admin') {
        window.location.href = 'admin.html';
    } else if (userRole === 'member') {
        window.location.href = 'member-dashboard.html';
    }
    
    // Setup login forms
    setupLoginForms();
});

function switchLoginTab(tab) {
    // Update tabs
    document.querySelectorAll('.login-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show selected form
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}Login`).classList.add('active');
}

function setupLoginForms() {
    // Member login
    const memberForm = document.getElementById('memberLoginForm');
    if (memberForm) {
        memberForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('memberEmail').value;
            const password = document.getElementById('memberPassword').value;
            
            await handleLogin(email, password, 'member');
        });
    }
    
    // Admin login
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
        adminForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            await handleLogin(email, password, 'admin');
        });
    }
}

async function handleLogin(email, password, role) {
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('.btn-login');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        // Simulate API call - Replace with actual Google Apps Script

        
        const response = await verifyCredentials(email, password, role);
     
        
        if (response.success) {
            // Store session
            sessionStorage.setItem('userId', response.member_id);
            sessionStorage.setItem('userRole', role);
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('isLoggedIn', 'true');
            
            if (role === 'admin') {
                sessionStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'member-dashboard.html';
            }
            
            // Log successful login
            logToSheet('info', `Successful ${role} login`, 'login', email);
            
        } else {
            alert('Invalid email or password');
            logToSheet('warning', `Failed ${role} login attempt`, 'login', email);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
        
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function verifyCredentials(email, password, role) {
    try {
        const result = await api.verifyLogin({
            email: email,
            password: password
        });
        
        return result;
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false };
    }
}

function logToSheet(level, message, location, user) {
    console.log(`[${level}] ${location}: ${message} - ${user}`);
}


