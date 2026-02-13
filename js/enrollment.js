// Enrollment functionality
document.addEventListener('DOMContentLoaded', function() {
    const subjects = document.querySelectorAll('input[name="subjects"]');
    const totalAmountSpan = document.getElementById('totalAmount');
    const enrollmentForm = document.getElementById('enrollmentForm');
    
    // Subject fees
    const subjectFees = {
        'Mathematics': 150,
        'Science': 150,
        'English': 140,
        'Malay': 140,
        'Mandarin': 140,
        'History': 130
    };
    
    // Calculate total
    function calculateTotal() {
        let total = 0;
        subjects.forEach(subject => {
            if (subject.checked) {
                total += subjectFees[subject.value];
            }
        });
        totalAmountSpan.textContent = `RM ${total}`;
        return total;
    }
    
    // Add event listeners to checkboxes
    subjects.forEach(subject => {
        subject.addEventListener('change', calculateTotal);
    });
    
    // Handle form submission
    enrollmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get selected subjects
        const selectedSubjects = [];
        subjects.forEach(subject => {
            if (subject.checked) {
                selectedSubjects.push(subject.value);
            }
        });
        
        if (selectedSubjects.length === 0) {
            alert('Please select at least one subject');
            return;
        }
        
        const formData = {
            full_name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            school: document.getElementById('school').value,
            form: document.getElementById('form').value,
            tuition_type: document.getElementById('tuitionType').value,
            subjects: selectedSubjects.join(', '),
            amount: calculateTotal()
        };
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-payment');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Create member first
            const memberResponse = await createMember(formData);
            
            if (memberResponse.success) {
                // Initiate ToyibPay payment
                const paymentData = {
                    amount: formData.amount,
                    customer_name: formData.full_name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    member_id: memberResponse.member_id,
                    description: `Tuition Fee - ${selectedSubjects.join(', ')}`
                };
                
                const paymentResponse = await initiateToyibPayment(paymentData);
                
                if (paymentResponse.success) {
                    // Log enrollment
                    await logToSheet('info', 
                        `Enrollment successful: ${memberResponse.member_id}`, 
                        'enrollment', 
                        formData.email
                    );
                    
                    // Redirect to payment page
                    window.location.href = paymentResponse.payment_url;
                } else {
                    throw new Error('Payment initiation failed');
                }
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('There was an error processing your enrollment. Please try again.');
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // API Functions
    async function createMember(data) {
        // Simulate API call - Replace with actual Google Apps Script URL
        const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        
        // For demo, return mock response
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    member_id: `MEM-${Date.now()}`
                });
            }, 1000);
        });
    }
    
    async function initiateToyibPayment(data) {
        // Simulate ToyibPay integration
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    payment_url: 'https://toyibpay.com/pay/demo123',
                    order_id: `ORDER-${Date.now()}`
                });
            }, 1500);
        });
    }
    
    async function logToSheet(level, message, location, user) {
        // Simulate logging
        console.log(`[${level}] ${location}: ${message} - ${user}`);
    }

// Package pricing data
const packagePricing = {
    primary: {
        '1': { price: 100, name: 'Single Subject' },
        '2': { price: 140, name: '2 Subjects Package' },
        '3': { price: 180, name: '3 Subjects Package' },
        '4': { price: 200, name: '4 Subjects Package' }
    },
    lowerSecondary: {
        '1': { price: 100, name: 'Single Subject' },
        '2': { price: 160, name: '2 Subjects Package' },
        '3': { price: 190, name: '3 Subjects Package' },
        '4': { price: 200, name: '4 Subjects Package' }
    },
    upperSecondary: {
        'A': { price: 180, name: 'Package A (3 Subjects)' },
        'B': { price: 200, name: 'Package B (4 Subjects)' },
        'C': { price: 250, name: 'Package C (5 Subjects)' },
        'D': { price: 300, name: 'Package D (All Subjects + 1-on-1)' },
        'E': { price: 150, name: 'Package E (2 Subjects)' }
    }
};

// Function to get package price based on form and subject count
function getPackagePrice(form, subjectCount) {
    if (form >= 4) {
        // Upper secondary - use package letters
        if (subjectCount <= 2) return 150; // Package E
        if (subjectCount === 3) return 180; // Package A
        if (subjectCount === 4) return 200; // Package B
        if (subjectCount === 5) return 250; // Package C
        if (subjectCount >= 6) return 300; // Package D
    } else if (form >= 1) {
        // Lower secondary
        if (subjectCount === 1) return 100;
        if (subjectCount === 2) return 160;
        if (subjectCount === 3) return 190;
        if (subjectCount >= 4) return 200;
    }
    return 0;
}

// Update total calculation in enrollment form
function calculateTotal() {
    const form = document.getElementById('form').value;
    const subjects = document.querySelectorAll('input[name="subjects"]:checked');
    const subjectCount = subjects.length;
    
    let total = 0;
    
    if (form >= 4) {
        // Upper secondary - package based pricing
        total = getPackagePrice(parseInt(form), subjectCount);
        
        // Show package name
        const packageInfo = document.getElementById('packageInfo');
        if (packageInfo) {
            if (subjectCount <= 2) {
                packageInfo.textContent = 'Package E - Basic Package (2 Subjects)';
            } else if (subjectCount === 3) {
                packageInfo.textContent = 'Package A - Standard Package (3 Subjects)';
            } else if (subjectCount === 4) {
                packageInfo.textContent = 'Package B - Premium Package (4 Subjects)';
            } else if (subjectCount === 5) {
                packageInfo.textContent = 'Package C - Advanced Package (5 Subjects)';
            } else if (subjectCount >= 6) {
                packageInfo.textContent = 'Package D - Premium Plus Package';
            }
        }
    } else {
        // Lower secondary and primary - per subject pricing
        const pricePerSubject = form >= 1 ? 100 : 100; // Base price
        total = subjectCount * pricePerSubject;
        
        // Apply package discount
        if (subjectCount === 2) total = form >= 1 ? 160 : 140;
        if (subjectCount === 3) total = form >= 1 ? 190 : 180;
        if (subjectCount >= 4) total = form >= 1 ? 200 : 200;
    }
    
    document.getElementById('totalAmount').textContent = `RM ${total}`;
    return total;
}
    
});
