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
});