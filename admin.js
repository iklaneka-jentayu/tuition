// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Authentication Check
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    alert('currentUser role='+currentUser.role)
    alert('currentUser email='+currentUser.email);
    currentUser.email = 'admin@excellearn.com';
     currentUser.role = 'admin';
    
    if (!currentUser.email || currentUser.role !== 'admin') {
        // Redirect to login if not admin
        window.location.href = 'index.html';
        return;
    }
    
    // Set current date
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', options);
    
    // Initialize Data
    initializeData();
    
    // Sidebar Navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Logout Button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // Modal Elements
    const studentModal = document.getElementById('studentModal');
    const confirmModal = document.getElementById('confirmModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalSave = document.getElementById('modalSave');
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmDelete = document.getElementById('confirmDelete');
    const addNewBtn = document.getElementById('addNewBtn');
    
    // Open Add New Modal
    addNewBtn.addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = 'Add New Student';
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').value = '';
        studentModal.classList.add('active');
    });
    
    // Close Modal
    modalClose.addEventListener('click', function() {
        studentModal.classList.remove('active');
    });
    
    modalCancel.addEventListener('click', function() {
        studentModal.classList.remove('active');
    });
    
    confirmCancel.addEventListener('click', function() {
        confirmModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === studentModal) {
            studentModal.classList.remove('active');
        }
        if (e.target === confirmModal) {
            confirmModal.classList.remove('active');
        }
    });
    
    // Save Student Data
    modalSave.addEventListener('click', function() {
        const studentData = collectFormData();
        
        if (!validateStudentForm(studentData)) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const studentId = document.getElementById('studentId').value;
        
        if (studentId) {
            // Update existing student
            updateStudent(studentId, studentData);
        } else {
            // Add new student
            addStudent(studentData);
        }
        
        studentModal.classList.remove('active');
    });
    
    // Table Actions
    document.addEventListener('click', function(e) {
        // Edit button
        if (e.target.closest('.btn-edit')) {
            const row = e.target.closest('tr');
            const studentId = row.querySelector('td:nth-child(2)').textContent;
            editStudent(studentId);
        }
        
        // Delete button
        if (e.target.closest('.btn-delete')) {
            const row = e.target.closest('tr');
            const studentId = row.querySelector('td:nth-child(2)').textContent;
            const studentName = row.querySelector('td:nth-child(3)').textContent;
            
            document.getElementById('confirmMessage').textContent = 
                `Are you sure you want to delete "${studentName}"?`;
            
            confirmModal.classList.add('active');
            
            confirmDelete.onclick = function() {
                deleteStudent(studentId);
                confirmModal.classList.remove('active');
            };
        }
    });
    
    // Select All checkbox
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#studentsTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    // Refresh Button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        loadStudents();
        showNotification('Data refreshed successfully', 'success');
    });
    
    // Export Button
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportToCSV();
    });
    
    // Process Payments Button
    document.getElementById('processPaymentBtn').addEventListener('click', function() {
        showNotification('Payment processing would be implemented here', 'info');
    });
    
    // Quick Actions
    document.getElementById('sendBulkEmail').addEventListener('click', function() {
        showNotification('Bulk email feature would be implemented here', 'info');
    });
    
    document.getElementById('generateReport').addEventListener('click', function() {
        generateReport();
    });
    
    document.getElementById('backupData').addEventListener('click', function() {
        backupData();
    });
    
    document.getElementById('importData').addEventListener('click', function() {
        showNotification('Data import feature would be implemented here', 'info');
    });
    
    // Pagination
    let currentPage = 1;
    const rowsPerPage = 10;
    
    document.getElementById('nextPage').addEventListener('click', function() {
        const totalRows = parseInt(document.getElementById('totalRows').textContent);
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            loadStudents(currentPage);
        }
    });
    
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadStudents(currentPage);
        }
    });
    
    // Initialize the dashboard
    function initializeData() {
        // Load initial data
        loadStudents();
        loadEnrollments();
        loadPayments();
        updateStats();
    }
    
    // Load Students Data
    function loadStudents(page = 1) {
        // In a real app, this would fetch from Google Sheets API
        // For demo, we'll use localStorage
        
        const students = getStudentsFromStorage();
        const totalRows = students.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        
        // Calculate pagination
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
        const pageData = students.slice(startIndex, endIndex);
        
        // Update table
        const tableBody = document.getElementById('studentsTableBody');
        tableBody.innerHTML = '';
        
        pageData.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="row-select"></td>
                <td>${student.id}</td>
                <td>${student.studentName}</td>
                <td>${student.parentName}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>${student.grade}</td>
                <td>${student.subjects}</td>
                <td>${student.plan}</td>
                <td><span class="status ${student.status}">${student.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-view" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update pagination info
        document.getElementById('startRow').textContent = startIndex + 1;
        document.getElementById('endRow').textContent = endIndex;
        document.getElementById('totalRows').textContent = totalRows;
        
        // Update page numbers
        updatePagination(totalPages, page);
        
        // Update current page
        currentPage = page;
    }
    
    function loadEnrollments() {
        // Similar implementation for enrollments
        const enrollments = getEnrollmentsFromStorage();
        const tableBody = document.getElementById('enrollmentsTableBody');
        
        tableBody.innerHTML = enrollments.map(enrollment => `
            <tr>
                <td>${enrollment.id}</td>
                <td>${formatDate(enrollment.date)}</td>
                <td>${enrollment.studentName}</td>
                <td>${enrollment.plan}</td>
                <td>RM ${enrollment.amount}</td>
                <td><span class="status ${enrollment.paymentStatus}">${enrollment.paymentStatus}</span></td>
                <td><span class="status ${enrollment.status}">${enrollment.status}</span></td>
                <td>
                    <button class="btn-view">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Update pending enrollments badge
        const pendingCount = enrollments.filter(e => e.status === 'pending').length;
        document.getElementById('pendingEnrollments').textContent = pendingCount;
    }
    
    function loadPayments() {
        // Similar implementation for payments
        const payments = getPaymentsFromStorage();
        const tableBody = document.getElementById('paymentsTableBody');
        
        tableBody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${formatDate(payment.date)}</td>
                <td>${payment.student}</td>
                <td>${payment.description}</td>
                <td>RM ${payment.amount}</td>
                <td>${payment.method}</td>
                <td><span class="status ${payment.status}">${payment.status}</span></td>
                <td>
                    <button class="btn-view">
                        <i class="fas fa-receipt"></i>
                    </button>
                </td>
                <td>
                    <button class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    function updateStats() {
        const students = getStudentsFromStorage();
        const enrollments = getEnrollmentsFromStorage();
        const payments = getPaymentsFromStorage();
        
        // Calculate stats
        const totalStudents = students.length;
        const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
        const totalRevenue = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        
        // Update DOM
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('activeEnrollments').textContent = activeEnrollments;
        document.getElementById('totalRevenue').textContent = `RM ${totalRevenue}`;
        document.getElementById('totalTutors').textContent = '25'; // Hardcoded for demo
    }
    
    // Student CRUD Operations
    function getStudentsFromStorage() {
        return JSON.parse(localStorage.getItem('excellearn_students') || '[]');
    }
    
    function saveStudentsToStorage(students) {
        localStorage.setItem('excellearn_students', JSON.stringify(students));
    }
    
    function addStudent(studentData) {
        const students = getStudentsFromStorage();
        
        const newStudent = {
            id: 'STU' + Date.now().toString().slice(-6),
            ...studentData,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        students.push(newStudent);
        saveStudentsToStorage(students);
        
        // Send to Google Sheets
        sendToGoogleSheets('students', newStudent);
        
        // Reload data
        loadStudents(currentPage);
        updateStats();
        
        showNotification('Student added successfully', 'success');
    }
    
    function editStudent(studentId) {
        const students = getStudentsFromStorage();
        const student = students.find(s => s.id === studentId);
        
        if (student) {
            // Populate form
            document.getElementById('studentId').value = student.id;
            document.getElementById('modalStudentName').value = student.studentName;
            document.getElementById('modalParentName').value = student.parentName;
            document.getElementById('modalEmail').value = student.email;
            document.getElementById('modalPhone').value = student.phone;
            document.getElementById('modalGrade').value = student.grade;
            document.getElementById('modalPlan').value = student.plan;
            document.getElementById('modalStatus').value = student.status;
            document.getElementById('modalNotes').value = student.notes || '';
            
            // Set subjects (for demo, simple split)
            if (student.subjects) {
                const subjectSelect = document.getElementById('modalSubjects');
                const subjects = student.subjects.split(', ');
                Array.from(subjectSelect.options).forEach(option => {
                    option.selected = subjects.includes(option.value);
                });
            }
            
            document.getElementById('modalTitle').textContent = 'Edit Student';
            studentModal.classList.add('active');
        }
    }
    
    function updateStudent(studentId, updatedData) {
        const students = getStudentsFromStorage();
        const index = students.findIndex(s => s.id === studentId);
        
        if (index !== -1) {
            students[index] = {
                ...students[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            
            saveStudentsToStorage(students);
            
            // Update in Google Sheets
            sendToGoogleSheets('update_student', { id: studentId, ...updatedData });
            
            // Reload data
            loadStudents(currentPage);
            updateStats();
            
            showNotification('Student updated successfully', 'success');
        }
    }
    
    function deleteStudent(studentId) {
        const students = getStudentsFromStorage();
        const filteredStudents = students.filter(s => s.id !== studentId);
        
        saveStudentsToStorage(filteredStudents);
        
        // Delete from Google Sheets
        sendToGoogleSheets('delete_student', { id: studentId });
        
        // Reload data
        loadStudents(currentPage);
        updateStats();
        
        showNotification('Student deleted successfully', 'success');
    }
    
    // Helper Functions
    function collectFormData() {
        const subjectsSelect = document.getElementById('modalSubjects');
        const selectedSubjects = Array.from(subjectsSelect.selectedOptions)
            .map(option => option.value);
        
        return {
            studentName: document.getElementById('modalStudentName').value,
            parentName: document.getElementById('modalParentName').value,
            email: document.getElementById('modalEmail').value,
            phone: document.getElementById('modalPhone').value,
            grade: document.getElementById('modalGrade').value,
            plan: document.getElementById('modalPlan').value,
            subjects: selectedSubjects.join(', '),
            status: document.getElementById('modalStatus').value,
            notes: document.getElementById('modalNotes').value
        };
    }
    
    function validateStudentForm(data) {
        return data.studentName && data.parentName && data.email && data.phone && data.grade && data.plan;
    }
    
    function updatePagination(totalPages, currentPage) {
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = '';
        
        // Show limited page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageNumber = document.createElement('span');
            pageNumber.className = 'page-number';
            if (i === currentPage) pageNumber.classList.add('active');
            pageNumber.textContent = i;
            pageNumber.addEventListener('click', () => loadStudents(i));
            pageNumbers.appendChild(pageNumber);
        }
        
        // Update button states
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function getEnrollmentsFromStorage() {
        return JSON.parse(localStorage.getItem('excellearn_enrollments') || '[]');
    }
    
    function getPaymentsFromStorage() {
        return JSON.parse(localStorage.getItem('excellearn_payments') || '[]');
    }
    
    function exportToCSV() {
        const students = getStudentsFromStorage();
        
        if (students.length === 0) {
            showNotification('No data to export', 'error');
            return;
        }
        
        // Create CSV content
        const headers = ['ID', 'Student Name', 'Parent Name', 'Email', 'Phone', 'Grade', 'Subjects', 'Plan', 'Status'];
        const csvRows = [
            headers.join(','),
            ...students.map(student => [
                student.id,
                `"${student.studentName}"`,
                `"${student.parentName}"`,
                student.email,
                student.phone,
                student.grade,
                `"${student.subjects}"`,
                student.plan,
                student.status
            ].join(','))
        ];
        
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `excellearn_students_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
    }
    
    function generateReport() {
        showNotification('Generating report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            const students = getStudentsFromStorage();
            const enrollments = getEnrollmentsFromStorage();
            const payments = getPaymentsFromStorage();
            
            const report = {
                generatedAt: new Date().toISOString(),
                summary: {
                    totalStudents: students.length,
                    activeStudents: students.filter(s => s.status === 'active').length,
                    totalEnrollments: enrollments.length,
                    activeEnrollments: enrollments.filter(e => e.status === 'active').length,
                    totalRevenue: payments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                },
                byPlan: groupBy(students, 'plan'),
                byGrade: groupBy(students, 'grade'),
                byStatus: groupBy(students, 'status')
            };
            
            // For demo, just show notification
            showNotification(`Report generated: ${report.summary.totalStudents} students, RM ${report.summary.totalRevenue} revenue`, 'success');
            
            // In real app, you would download the report
            console.log('Generated Report:', report);
            
        }, 1000);
    }
    
    function backupData() {
        const data = {
            students: getStudentsFromStorage(),
            enrollments: getEnrollmentsFromStorage(),
            payments: getPaymentsFromStorage(),
            users: JSON.parse(localStorage.getItem('excellearn_users') || '[]'),
            backupDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `excellearn_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Backup created successfully', 'success');
    }
    
    function groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'Unknown';
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }
    
    function sendToGoogleSheets(action, data) {
        // Your Google Apps Script Web App URL
        const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE';
        
        const payload = {
            action: action,
            data: data
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
            console.log(`Data sent to Google Sheets: ${action}`);
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });
    }
    
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
    
    // Initialize sample data if empty
    function initializeSampleData() {
        if (getStudentsFromStorage().length === 0) {
            const sampleStudents = [
                {
                    id: 'STU001',
                    studentName: 'Ahmad bin Abdullah',
                    parentName: 'Abdullah bin Ali',
                    email: 'ahmad@example.com',
                    phone: '012-3456789',
                    grade: 'form4',
                    subjects: 'Mathematics, Science, English',
                    plan: 'premium',
                    status: 'active',
                    createdAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: 'STU002',
                    studentName: 'Siti Nurhaliza',
                    parentName: 'Nurhaliza binti Kamal',
                    email: 'siti@example.com',
                    phone: '013-9876543',
                    grade: 'form5',
                    subjects: 'Mathematics, Physics, Chemistry',
                    plan: 'standard',
                    status: 'active',
                    createdAt: '2024-02-20T14:45:00Z'
                },
                {
                    id: 'STU003',
                    studentName: 'Wei Chen',
                    parentName: 'Chen Lee',
                    email: 'wei@example.com',
                    phone: '011-2233445',
                    grade: 'form3',
                    subjects: 'English, Malay, History',
                    plan: 'basic',
                    status: 'pending',
                    createdAt: '2024-03-05T09:15:00Z'
                }
            ];
            
            saveStudentsToStorage(sampleStudents);
            
            // Also create sample enrollments and payments
            const sampleEnrollments = [
                {
                    id: 'ENR001',
                    date: '2024-01-15T10:30:00Z',
                    studentName: 'Ahmad bin Abdullah',
                    plan: 'premium',
                    amount: '399',
                    paymentStatus: 'completed',
                    status: 'active'
                },
                {
                    id: 'ENR002',
                    date: '2024-02-20T14:45:00Z',
                    studentName: 'Siti Nurhaliza',
                    plan: 'standard',
                    amount: '199',
                    paymentStatus: 'completed',
                    status: 'active'
                }
            ];
            
            const samplePayments = [
                {
                    id: 'PAY001',
                    date: '2024-01-15T11:00:00Z',
                    student: 'Ahmad bin Abdullah',
                    description: 'Premium Plan - January 2024',
                    amount: '399',
                    method: 'ToyyibPay',
                    status: 'completed'
                },
                {
                    id: 'PAY002',
                    date: '2024-02-20T15:00:00Z',
                    student: 'Siti Nurhaliza',
                    description: 'Standard Plan - February 2024',
                    amount: '199',
                    method: 'Bank Transfer',
                    status: 'completed'
                }
            ];
            
            localStorage.setItem('excellearn_enrollments', JSON.stringify(sampleEnrollments));
            localStorage.setItem('excellearn_payments', JSON.stringify(samplePayments));
        }
    }
    
    // Call to initialize sample data
    initializeSampleData();
});
