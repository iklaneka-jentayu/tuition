// Admin Dashboard Functionality

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbw9m0WkShtm2FpaqWIiB5r75nynJsYgGFtt4U_VTV9a4G49KpL_WZBxOhSMgUx2SiVJ/exec';
let currentMembers = [];
let currentPayments = [];
let currentLogs = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    // checkAdminAuth();
    
    // Load initial data
    loadDashboardData();
    
    // Setup search listeners
    setupSearchListeners();
});

function checkAdminAuth() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        window.location.href = 'login.html';
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function switchTab(tabName) {
    // Update tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show selected panel
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById(`${tabName}Panel`).style.display = 'block';
    
    // Load tab data
    if (tabName === 'members') {
        loadMembers();
    } else if (tabName === 'payments') {
        loadPayments();
    } else if (tabName === 'logs') {
        loadLogs();
    }
}

async function loadDashboardData() {
    try {
        const members = await getAllMembers();
        const payments = await getAllPayments();
        
        // Update stats
        document.getElementById('totalMembers').textContent = members.length;
        
        const onlineCount = members.filter(m => m.tuition_type.includes('online')).length;
        const offlineCount = members.filter(m => m.tuition_type.includes('offline')).length;
        
        document.getElementById('onlineStudents').textContent = onlineCount;
        document.getElementById('offlineStudents').textContent = offlineCount;
        
        const totalRevenue = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        document.getElementById('totalRevenue').textContent = `RM ${totalRevenue}`;
        
        // Load members table
        loadMembers();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        logToSheet('error', `Dashboard load error: ${error.message}`, 'loadDashboardData', 'admin');
    }
}

async function loadMembers() {
    try {
        const members = await getAllMembers();
        currentMembers = members;
        
        const tbody = document.getElementById('membersTableBody');
        tbody.innerHTML = '';
        
        members.forEach(member => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${member.member_id}</td>
                <td>${member.full_name}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>${member.subjects}</td>
                <td>${member.tuition_type}</td>
                <td><span class="status-badge status-${member.status}">${member.status}</span></td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="viewMember('${member.member_id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-edit" onclick="editMember('${member.member_id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteMember('${member.member_id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

async function loadPayments() {
    try {
        const payments = await getAllPayments();
        currentPayments = payments;
        
        const tbody = document.getElementById('paymentsTableBody');
        tbody.innerHTML = '';
        
        payments.forEach(payment => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${payment.payment_id}</td>
                <td>${payment.member_id}</td>
                <td>RM ${payment.amount}</td>
                <td>${new Date(payment.payment_date).toLocaleString()}</td>
                <td>${payment.transaction_id || '-'}</td>
                <td>${payment.payment_method}</td>
                <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="viewPayment('${payment.payment_id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-edit" onclick="editPayment('${payment.payment_id}')"><i class="fas fa-edit"></i></button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function loadLogs() {
    try {
        const logs = await getSystemLogs();
        currentLogs = logs;
        
        const tbody = document.getElementById('logsTableBody');
        tbody.innerHTML = '';
        
        logs.slice(0, 50).forEach(log => { // Show last 50 logs
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="status-badge status-${log.level}">${log.level}</span></td>
                <td>${log.message}</td>
                <td>${log.location}</td>
                <td>${log.user}</td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// CRUD Operations
async function getAllMembers() {
    try {
        const result = await api.getAllMembers();
        return result.members || [];
    } catch (error) {
        console.error('Error loading members:', error);
        return [];
    }
}

async function getAllPayments() {
    try {
        const result = await api.getMemberPayments({}); // Get all payments
        return result.payments || [];
    } catch (error) {
        console.error('Error loading payments:', error);
        return [];
    }
}

async function getSystemLogs() {
    try {
        // Implement logs retrieval
        return [];
    } catch (error) {
        console.error('Error loading logs:', error);
        return [];
    }
}

function showAddMemberModal() {
    document.getElementById('modalTitle').textContent = 'Add New Member';
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('memberModal').classList.add('active');
}

function editMember(memberId) {
    const member = currentMembers.find(m => m.member_id === memberId);
    if (member) {
        document.getElementById('modalTitle').textContent = 'Edit Member';
        document.getElementById('memberId').value = member.member_id;
        document.getElementById('fullName').value = member.full_name;
        document.getElementById('email').value = member.email;
        document.getElementById('phone').value = member.phone;
        document.getElementById('subjects').value = member.subjects;
        document.getElementById('tuitionType').value = member.tuition_type;
        document.getElementById('status').value = member.status;
        document.getElementById('passwordField').style.display = 'none';
        
        document.getElementById('memberModal').classList.add('active');
    }
}

function viewMember(memberId) {
    // Implement member details view
    console.log('View member:', memberId);
}

async function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            // Simulate delete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            logToSheet('warning', `Member deleted: ${memberId}`, 'deleteMember', 'admin');
            loadMembers(); // Reload members
            loadDashboardData(); // Reload stats
            
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Error deleting member');
        }
    }
}

function closeModal() {
    document.getElementById('memberModal').classList.remove('active');
}

// Search functions
function setupSearchListeners() {
    const memberSearch = document.getElementById('memberSearch');
    if (memberSearch) {
        memberSearch.addEventListener('input', function() {
            searchMembers(this.value);
        });
    }
}

function searchMembers(query) {
    const searchTerm = query.toLowerCase();
    const filtered = currentMembers.filter(member => 
        member.full_name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.member_id.toLowerCase().includes(searchTerm)
    );
    
    // Update table with filtered results
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(member => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${member.member_id}</td>
            <td>${member.full_name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.subjects}</td>
            <td>${member.tuition_type}</td>
            <td><span class="status-badge status-${member.status}">${member.status}</span></td>
            <td class="action-buttons">
                <button class="btn-view" onclick="viewMember('${member.member_id}')"><i class="fas fa-eye"></i></button>
                <button class="btn-edit" onclick="editMember('${member.member_id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteMember('${member.member_id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}

function searchPayments() {
    // Implement payment search
}

// Settings functions
function saveSettings() {
    const settings = {
        spreadsheetId: document.getElementById('spreadsheetId').value,
        merchantId: document.getElementById('merchantId').value,
        apiKey: document.getElementById('apiKey').value
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    alert('Settings saved successfully');
    logToSheet('info', 'Admin settings updated', 'saveSettings', 'admin');
}


function syncData() {
    loadDashboardData();
    logToSheet('info', 'Data synchronized', 'syncData', 'admin');
}

function refreshLogs() {
    loadLogs();
}

function logToSheet(level, message, location, user) {
    // Implement actual logging to Google Sheets
    console.log(`[${level}] ${location}: ${message} - ${user}`);
}

async function createMember(data) {
    try {
        return await api.createMember(data);
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
}

async function updateMember(data) {
    try {
        return await api.updateMember(data);
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
}

async function deleteMember(memberId) {
    try {
        return await api.deleteMember({ member_id: memberId });
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
}

async function initializeSheets() {
    try {
        return await api.initializeSheets();
    } catch (error) {
        console.error('Error initializing sheets:', error);
        throw error;
    }
}

// Member form submission
document.getElementById('memberForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const memberData = Object.fromEntries(formData.entries());
    
    try {
        if (memberData.member_id) {
            // Update existing member
            await updateMember(memberData);
        } else {
            // Create new member
            await createMember(memberData);
        }
        
        closeModal();
        loadMembers();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error saving member:', error);
        alert('Error saving member');
    }

});


