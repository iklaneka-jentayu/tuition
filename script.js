// Initialize form validation
if (document.readyState !== 'loading') myInitCode()
else document.addEventListener('DOMContentLoaded', myInitCode);

// Main JavaScript for ExcelLearn Tuition Center
function myInitCode(){
    console.log("myInitCode");
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    //alert('DOMContentLoaded');
    if (menuToggle) {
        //alert('menuToggle');
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Enrollment Form Submission
    const enrollmentForm = document.getElementById('enrollmentForm');
    const toyibpayButton = document.getElementById('toyibpayButton');
    
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validation
            if (!validateEnrollmentForm()) {
                return;
            }
            
            // Collect form data
            const formData = new FormData(enrollmentForm);
            const enrollmentData = Object.fromEntries(formData);
            
            // Show payment button
            if (toyibpayButton) {
                toyibpayButton.style.display = 'block';
                
                // Scroll to payment button
                toyibpayButton.scrollIntoView({ behavior: 'smooth' });
                
                // Store enrollment data for payment processing
                localStorage.setItem('pendingEnrollment', JSON.stringify(enrollmentData));
                
                // Send enrollment data to Google Sheets
                sendToGoogleSheets(enrollmentData);
            }
            
            // Show success message
            showNotification('Enrollment submitted successfully! Please proceed to payment.', 'success');
        });
    }
    
    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const inputs = contactForm.querySelectorAll('input, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--danger-color)';
                } else {
                    input.style.borderColor = '#ddd';
                }
            });
            
            if (isValid) {
                showNotification('Message sent successfully! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }
    
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            
            if (validateEmail(emailInput.value)) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form validation functions
    function validateEnrollmentForm() {
        const requiredFields = enrollmentForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'var(--danger-color)';
                
                // Add error message
                if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = 'var(--danger-color)';
                    errorMsg.style.fontSize = '0.8rem';
                    errorMsg.style.display = 'block';
                    errorMsg.style.marginTop = '5px';
                    errorMsg.textContent = 'This field is required';
                    field.parentNode.appendChild(errorMsg);
                }
            } else {
                field.style.borderColor = '#ddd';
                
                // Remove error message if exists
                const errorMsg = field.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
        
        // Validate email format
        const emailField = document.getElementById('email');
        if (emailField.value && !validateEmail(emailField.value)) {
            isValid = false;
            emailField.style.borderColor = 'var(--danger-color)';
            showNotification('Please enter a valid email address.', 'error');
        }
        
        // Validate phone number
        const phoneField = document.getElementById('phone');
        if (phoneField.value && !validatePhone(phoneField.value)) {
            isValid = false;
            phoneField.style.borderColor = 'var(--danger-color)';
            showNotification('Please enter a valid phone number.', 'error');
        }
        
        return isValid;
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.zIndex = '9999';
        notification.style.display = 'flex';
        notification.style.justifyContent = 'space-between';
        notification.style.alignItems = 'center';
        notification.style.minWidth = '300px';
        notification.style.maxWidth = '500px';
        notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        notification.style.animation = 'slideIn 0.3s ease';
        
        // Set background color based on type
        const colors = {
            success: 'var(--success-color)',
            error: 'var(--danger-color)',
            info: 'var(--primary-color)'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        document.body.appendChild(notification);
        
        // Add CSS animations
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
    }
    
    // Send data to Google Sheets
    function sendToGoogleSheets(data) {
        // Your Google Apps Script Web App URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwOBs2XIB1NryAYH9_QSexo6qmns0rcajp8RPyT2wleQDX7-Yj91QVj99uyIfc-ccQD/exec';
        // Prepare data for submission
        const payload = {
            action: 'create',
            data: {
                timestamp: new Date().toISOString(),
                studentName: data.studentName,
                parentName: data.parentName,
                email: data.email,
                phone: data.phone,
                grade: data.grade,
                subjects: Array.isArray(data.subjects) ? data.subjects.join(', ') : data.subjects,
                learningMode: data.learningMode,
                plan: data.plan,
                message: data.message || '',
                status: 'pending_payment'
            }
        };
        
        // Send POST request
        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', // Note: 'no-cors' won't allow reading response
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            console.log('Data sent to Google Sheets');
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });
    }
    
    // ToyyibPay integration
    window.processToyibPay = function() {
        // Get enrollment data
        const enrollmentData = JSON.parse(localStorage.getItem('pendingEnrollment') || '{}');
        
        if (!enrollmentData.plan) {
            showNotification('No enrollment data found. Please fill out the form first.', 'error');
            return;
        }
        
        // Determine amount based on plan
        const planPrices = {
            'basic': 99,
            'standard': 199,
            'premium': 399,
            'trial': 0
        };
        
        const amount = planPrices[enrollmentData.plan] || 0;
        
        if (amount === 0) {
            showNotification('Free trial registration successful! We will contact you soon.', 'success');
            localStorage.removeItem('pendingEnrollment');
            return;
        }
        
        // In a real implementation, you would integrate with ToyyibPay API
        // This is a mock implementation
        
        showNotification(`Redirecting to ToyyibPay for RM ${amount} payment...`, 'info');
        
        // Simulate payment process
        setTimeout(() => {
            // In real implementation, this would redirect to ToyyibPay
            // window.location.href = `https://toyyibpay.com/${YOUR_CODE}`;
            
            // Mock successful payment
            const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo
            
            if (paymentSuccess) {
                showNotification('Payment successful! Your enrollment is now complete.', 'success');
                
                // Update status in Google Sheets
                updateEnrollmentStatus(enrollmentData.email, 'active');
                
                // Clear pending enrollment
                localStorage.removeItem('pendingEnrollment');
            } else {
                showNotification('Payment failed. Please try again or contact support.', 'error');
            }
        }, 2000);
    };
    
    // Update enrollment status in Google Sheets
    function updateEnrollmentStatus(email, status) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwOBs2XIB1NryAYH9_QSexo6qmns0rcajp8RPyT2wleQDX7-Yj91QVj99uyIfc-ccQD/exec';
        
        const payload = {
            action: 'update',
            email: email,
            updates: {
                status: status,
                paymentDate: new Date().toISOString()
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
            console.log('Status updated in Google Sheets');
        })
        .catch(error => {
            console.error('Error updating status:', error);
        });
    }
    
    // Initialize animations on scroll
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.feature, .subject-card, .pricing-card, .testimonial-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });
        
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(element);
        });
    }
    
    // Initialize animations when page loads
    setTimeout(initScrollAnimations, 500);
};
