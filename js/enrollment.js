// Complete Enrollment JavaScript

$(document).ready(function() {
    // Initialize Select2 for multiple subject selection
    $('#subjects').select2({
        placeholder: 'Select subjects',
        allowClear: true,
        width: '100%'
    });
    
    // Set minimum date for DOB (18 years ago)
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    document.getElementById('studentDob').max = minDate.toISOString().split('T')[0];
    document.getElementById('studentDob').min = maxDate.toISOString().split('T')[0];
    
    // File upload handling
    document.getElementById('reportCards').addEventListener('change', function(e) {
        const fileInfo = document.getElementById('fileInfo');
        const files = e.target.files;
        
        if (files.length > 0) {
            let fileList = '<strong>Selected files:</strong><br>';
            for (let i = 0; i < files.length; i++) {
                fileList += `${files[i].name} (${(files[i].size / 1024).toFixed(2)} KB)<br>`;
            }
            fileInfo.innerHTML = fileList;
            fileInfo.style.display = 'block';
        } else {
            fileInfo.style.display = 'none';
        }
    });
    
    // Initialize packages based on level
    updatePackages();
});

// Package definitions
const packages = {
    primary: {
        '1': { price: 100, name: 'Single Subject', subjects: 1, features: ['basic'] },
        '2': { price: 140, name: '2 Subjects Package', subjects: 2, features: ['basic', 'report'] },
        '3': { price: 180, name: '3 Subjects Package', subjects: 3, features: ['basic', 'report', 'recordings'] },
        '4': { price: 200, name: '4 Subjects Package', subjects: 4, features: ['basic', 'report', 'recordings', 'assessment'] }
    },
    lowerSecondary: {
        '1': { price: 100, name: 'Single Subject', subjects: 1, features: ['basic'] },
        '2': { price: 160, name: '2 Subjects Package', subjects: 2, features: ['basic', 'report'] },
        '3': { price: 190, name: '3 Subjects Package', subjects: 3, features: ['basic', 'report', 'recordings'] },
        '4': { price: 200, name: '4 Subjects Package', subjects: 4, features: ['basic', 'report', 'recordings', 'assessment'] }
    },
    upperSecondary: {
        'E': { price: 150, name: 'Package E', subjects: 2, features: ['basic'] },
        'A': { price: 180, name: 'Package A', subjects: 3, features: ['basic', 'report'] },
        'B': { price: 200, name: 'Package B', subjects: 4, features: ['basic', 'report', 'recordings'] },
        'C': { price: 250, name: 'Package C', subjects: 5, features: ['basic', 'report', 'recordings', 'assessment'] },
        'D': { price: 300, name: 'Package D', subjects: 6, features: ['basic', 'report', 'recordings', 'assessment', 'tutoring'] }
    }
};

// Form navigation
let currentSection = 1;
const totalSections = 4;

function nextSection(section) {
    if (validateSection(section)) {
        document.getElementById(`section${section}`).classList.remove('active');
        document.getElementById(`section${section + 1}`).classList.add('active');
        
        // Update progress bar
        document.querySelector(`.progress-step[data-step="${section}"]`).classList.add('completed');
        document.querySelector(`.progress-step[data-step="${section}"]`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${section + 1}"]`).classList.add('active');
        
        currentSection = section + 1;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevSection(section) {
    document.getElementById(`section${section}`).classList.remove('active');
    document.getElementById(`section${section - 1}`).classList.add('active');
    
    // Update progress bar
    document.querySelector(`.progress-step[data-step="${section}"]`).classList.remove('active', 'completed');
    document.querySelector(`.progress-step[data-step="${section - 1}"]`).classList.add('active');
    
    currentSection = section - 1;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateSection(section) {
    let isValid = true;
    const sectionElement = document.getElementById(`section${section}`);
    const requiredFields = sectionElement.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
        
        // Phone validation
        if (field.id === 'studentPhone' && field.value) {
            const phoneRegex = /^[0-9]{3}-[0-9]{7,8}$/;
            if (!phoneRegex.test(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
    });
    
    if (!isValid) {
        alert(__(`enroll.error.required_fields`));
    }
    
    return isValid;
}

// Update packages based on selected level
function updatePackages() {
    const level = document.getElementById('currentLevel').value;
    const packageContainer = document.getElementById('packageContainer');
    
    if (!level) {
        packageContainer.innerHTML = '<p>Please select current level first</p>';
        return;
    }
    
    let packageType;
    if (['year3', 'year4', 'year5', 'year6'].includes(level)) {
        packageType = 'primary';
    } else if (['form1', 'form2', 'form3'].includes(level)) {
        packageType = 'lowerSecondary';
    } else {
        packageType = 'upperSecondary';
    }
    
    displayPackages(packageType);
}

function displayPackages(packageType) {
    const packageContainer = document.getElementById('packageContainer');
    const packagesData = packages[packageType];
    
    let html = '';
    for (const [key, pkg] of Object.entries(packagesData)) {
        html += `
            <div class="package-card" onclick="selectPackage('${packageType}', '${key}')">
                <div class="package-name">${pkg.name}</div>
                <div class="package-price">RM ${pkg.price}</div>
                <div class="package-subjects">${pkg.subjects} subjects</div>
            </div>
        `;
    }
    
    packageContainer.innerHTML = html;
}

let selectedPackage = null;

function selectPackage(type, packageKey) {
    selectedPackage = packages[type][packageKey];
    
    // Highlight selected package
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Update subject selection based on package
    const subjectSelect = $('#subjects');
    subjectSelect.val(null).trigger('change');
    
    // Limit subject selection to package subjects
    if (subjectSelect.data('select2')) {
        subjectSelect.data('select2').destroy();
    }
    
    subjectSelect.select2({
        placeholder: `Select up to ${selectedPackage.subjects} subjects`,
        maximumSelectionLength: selectedPackage.subjects,
        allowClear: true,
        width: '100%'
    });
    
    calculateTotal();
}

// Calculate total amount
function calculateTotal() {
    const registrationFee = 50;
    const materialFee = 30;
    const selectedSubjects = $('#subjects').val() || [];
    const subjectCount = selectedSubjects.length;
    
    let packagePrice = 0;
    let packageName = '-';
    
    if (selectedPackage) {
        packagePrice = selectedPackage.price;
        packageName = selectedPackage.name;
        
        // Validate subject count matches package
        if (subjectCount > selectedPackage.subjects) {
            alert(`You can only select up to ${selectedPackage.subjects} subjects for this package`);
            $('#subjects').val(selectedSubjects.slice(0, selectedPackage.subjects)).trigger('change');
        }
    } else {
        // Calculate based on individual subjects if no package selected
        const level = document.getElementById('currentLevel').value;
        if (level) {
            const subjectPrice = getSubjectPrice(level);
            packagePrice = subjectCount * subjectPrice;
            packageName = 'Custom Selection';
        }
    }
    
    const total = packagePrice + registrationFee + materialFee;
    
    // Update summary
    document.getElementById('summaryPackage').textContent = packageName;
    document.getElementById('summarySubjects').textContent = subjectCount;
    document.getElementById('summaryTotal').textContent = `RM ${total}`;
    
    return total;
}

function getSubjectPrice(level) {
    if (['form4', 'form5'].includes(level)) {
        return 100; // Upper secondary base price
    } else if (['form1', 'form2', 'form3'].includes(level)) {
        return 90; // Lower secondary base price
    } else {
        return 80; // Primary base price
    }
}

// Payment method selection
function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    document.getElementById('paymentMethod').value = method;
}

// Promo code application
function applyPromoCode() {
    const promoCode = document.getElementById('promoCode').value.toUpperCase();
    
    // Demo promo codes
    const promos = {
        'WELCOME10': 10,
        'STUDENT20': 20,
        'FAMILY15': 15
    };
    
    if (promos[promoCode]) {
        const discount = promos[promoCode];
        const currentTotal = parseFloat(document.getElementById('summaryTotal').textContent.replace('RM ', ''));
        const newTotal = currentTotal - (currentTotal * discount / 100);
        
        alert(`Promo code applied! You get ${discount}% discount`);
        document.getElementById('summaryTotal').textContent = `RM ${newTotal.toFixed(2)}`;
        
        logToSheet('info', `Promo code ${promoCode} applied with ${discount}% discount`, 'Enrollment');
    } else {
        alert('Invalid promo code');
    }
}

// Form submission
document.getElementById('enrollmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateSection(currentSection)) {
        return;
    }
    
    if (!document.getElementById('agreeTerms').checked) {
        alert(__(`enroll.error.terms_required`));
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(this);
    const enrollmentData = {
        student: {
            fullName: formData.get('studentFullName'),
            ic: formData.get('studentIc'),
            dob: formData.get('studentDob'),
            gender: formData.get('gender'),
            nationality: formData.get('nationality'),
            race: formData.get('race'),
            email: formData.get('studentEmail'),
            phone: formData.get('studentPhone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            postcode: formData.get('postcode')
        },
        parent: {
            father: {
                name: formData.get('fatherName'),
                ic: formData.get('fatherIc'),
                occupation: formData.get('fatherOccupation'),
                phone: formData.get('fatherPhone'),
                email: formData.get('fatherEmail')
            },
            mother: {
                name: formData.get('motherName'),
                ic: formData.get('motherIc'),
                occupation: formData.get('motherOccupation'),
                phone: formData.get('motherPhone'),
                email: formData.get('motherEmail')
            },
            emergency: {
                name: formData.get('emergencyName'),
                relation: formData.get('emergencyRelation'),
                phone: formData.get('emergencyPhone')
            }
        },
        academic: {
            school: {
                name: formData.get('schoolName'),
                type: formData.get('schoolType')
            },
            level: formData.get('currentLevel'),
            stream: formData.get('stream'),
            subjects: $('#subjects').val(),
            package: selectedPackage ? selectedPackage.name : 'Custom',
            previousAchievement: formData.get('previousAchievement'),
            targetGrade: formData.get('targetGrade'),
            learningNeeds: formData.get('learningNeeds')
        },
        payment: {
            billing: {
                name: formData.get('billingName'),
                email: formData.get('billingEmail'),
                phone: formData.get('billingPhone'),
                company: formData.get('companyName'),
                taxId: formData.get('taxId')
            },
            method: formData.get('paymentMethod'),
            promoCode: formData.get('promoCode'),
            total: document.getElementById('summaryTotal').textContent.replace('RM ', ''),
            receiveUpdates: formData.get('receiveUpdates') === 'on'
        },
        timestamp: new Date().toISOString()
    };
    
    try {
        // Send to backend
        const response = await submitEnrollment(enrollmentData);
        
        if (response.success) {
            // Log successful enrollment
            logToSheet('info', `New enrollment: ${enrollmentData.student.fullName}`, 'Enrollment', enrollmentData.student.email);
            
            // Redirect to payment
            if (enrollmentData.payment.method === 'toyibpay') {
                window.location.href = `https://toyibpay.com/pay/${response.paymentId}`;
            } else {
                alert('Enrollment successful! Please complete payment.');
                window.location.href = 'member-dashboard.html';
            }
        } else {
            throw new Error(response.message || 'Enrollment failed');
        }
        
    } catch (error) {
        console.error('Enrollment error:', error);
        alert(__(`enroll.error.general`));
        
        // Log error
        logToSheet('error', `Enrollment failed: ${error.message}`, 'Enrollment', enrollmentData.student.email);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

async function submitEnrollment(data) {
    try {
        const result = await api.submitEnrollment(data);
        
        if (result.success) {
            // Process payment if needed
            if (data.payment.method === 'toyibpay') {
                const paymentResult = await api.processToyibPay({
                    member_id: result.member_id,
                    amount: data.payment.total,
                    customer_name: data.student.fullName,
                    customer_email: data.student.email,
                    customer_phone: data.student.phone,
                    description: 'Tuition Fee Enrollment',
                    package_name: data.academic.package
                });
                
                return {
                    ...result,
                    payment_url: paymentResult.payment_url
                };
            }
            
            return result;
        }
        
        throw new Error(result.message || 'Enrollment failed');
        
    } catch (error) {
        console.error('Enrollment error:', error);
        throw error;
    }
}

// Helper function for translations
function __(key) {
    // This would use the language.js translation function
    return key;
}

// Log to sheet function
function logToSheet(level, message, location, user) {
    console.log(`[${level}] ${location}: ${message} - ${user}`);
}


