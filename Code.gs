/**
 * EduSmart Tuition Platform - Complete Google Apps Script Backend
 * All CRUD Operations with Google Sheets
 * Version: 2.0
 */

// ============================================
// CONFIGURATION
// ============================================
const SPREADSHEET_ID = '1Ab4GdO3rKNkewXmiNeBkjaA9LwHbotQz055XRmWOak0'; // Replace with your Google Sheet ID
const SHEET_NAMES = {
    MEMBERS: 'Members',
    PAYMENTS: 'Payments',
    LOGS: 'Logs',
    SUBJECTS: 'Subjects',
    CALENDAR: 'CalendarEvents',
    TEACHERS: 'Teachers',
    STUDENTS: 'Students',
    ENROLLMENTS: 'Enrollments',
    CHAT_HISTORY: 'ChatHistory',
    CHAT_FEEDBACK: 'ChatbotFeedback',
    PRICING: 'Pricing',
    ATTENDANCE: 'Attendance',
    LOG_SHEET: 'DebugLogs'
};

function log(level, message, payload) {

  SpreadsheetApp
    .getActive()
    .getSheetByName(SHEET_NAMES.LOG_SHEET)
    .appendRow([
      new Date(),
      level,
      message,
      payload ? JSON.stringify(payload) : ""
    ]);

  Logger.log(`[${level}] ${message}`);
}

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

function doGet(e) {
    try {
        const action = e.parameter.action;
        logToSheet('info', `doGet called with action: ${action}`, 'doGet');
        
        let result;
        switch(action) {
            case 'getMember':
                result = getMember(e.parameter);
                break;
            case 'getAllMembers':
                result = getAllMembers();
                break;
            case 'getMemberPayments':
                result = getMemberPayments(e.parameter);
                break;
            case 'getPayment':
                result = getPayment(e.parameter);
                break;
            case 'getCalendarEvents':
                result = getCalendarEvents(e.parameter);
                break;
            case 'getTeachers':
                result = getTeachers();
                break;
            case 'getStudents':
                result = getStudents();
                break;
            case 'getSubjects':
                result = getSubjects();
                break;
            case 'getPricing':
                result = getPricing(e.parameter);
                break;
            case 'getAttendance':
                result = getAttendance(e.parameter);
                break;
            case 'getChatHistory':
                result = getChatHistory(e.parameter);
                break;
            case 'getChatbotAnalytics':
                result = getChatbotAnalytics();
                break;
            case 'initializeSheets':
                result = initializeSheets();
                break;
            default:
                result = { success: false, message: 'Invalid action' };
        }
        
        return createJsonResponse(result);
        
    } catch (error) {
        logToSheet('error', `doGet error: ${error.toString()}`, 'doGet');
        return createJsonResponse({ success: false, error: error.toString() });
    }
}

function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const action = params.action;
        const data = params.data;

        log("INFO", "doPost called", e);
        logToSheet('info', `doPost called with action: ${action}`, 'doPost', data?.user || 'System');
        
        let result;
        switch(action) {
            // Member CRUD
            case 'createMember':
                result = createMember(data);
                break;
            case 'updateMember':
                result = updateMember(data);
                break;
            case 'deleteMember':
                result = deleteMember(data);
                break;
            case 'verifyLogin':
                result = verifyLogin(data);
                break;
            
            // Payment CRUD
            case 'createPayment':
                result = createPayment(data);
                break;
            case 'updatePayment':
                result = updatePayment(data);
                break;
            case 'processToyibPay':
                result = processToyibPay(data);
                break;
            case 'verifyToyibPay':
                result = verifyToyibPay(data);
                break;
            
            // Calendar CRUD
            case 'createCalendarEvent':
                result = createCalendarEvent(data);
                break;
            case 'updateCalendarEvent':
                result = updateCalendarEvent(data);
                break;
            case 'deleteCalendarEvent':
                result = deleteCalendarEvent(data);
                break;
            case 'checkScheduleConflicts':
                result = checkScheduleConflicts(data);
                break;
            
            // Enrollment
            case 'submitEnrollment':
                result = submitEnrollment(data);
                break;
            case 'getEnrollment':
                result = getEnrollment(data);
                break;
            case 'updateEnrollment':
                result = updateEnrollment(data);
                break;
            
            // Chatbot
            case 'chat':
                result = handleChatRequest(data);
                break;
            case 'feedback':
                result = handleFeedback(data);
                break;
            case 'escalate':
                result = handleEscalation(data);
                break;
            
            // Attendance
            case 'markAttendance':
                result = markAttendance(data);
                break;
            case 'getStudentAttendance':
                result = getStudentAttendance(data);
                break;
            
            // Logging
            case 'log':
                result = logToSheet(data.level, data.message, data.location, data.user);
                break;
                
            default:
                result = { success: false, message: 'Invalid action' };
        }
        
        return createJsonResponse(result);
        
    } catch (error) {
        logToSheet('error', `doPost error: ${error.toString()}`, 'doPost');
        return createJsonResponse({ success: false, error: error.toString() });
    }
}

// ============================================
// MEMBER CRUD FUNCTIONS
// ============================================

function createMember(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.MEMBERS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.MEMBERS);
            sheet.getRange('1:1').setValues([[
                'member_id', 'full_name', 'ic_number', 'email', 'phone', 
                'address', 'city', 'state', 'postcode', 'subjects',
                'tuition_type', 'enrollment_date', 'status', 'password_hash',
                'parent_name', 'parent_phone', 'parent_email', 'emergency_contact',
                'school_name', 'current_level', 'created_at', 'updated_at'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const timestamp = new Date();
        const memberId = `MEM-${timestamp.getTime()}`;
        const passwordHash = Utilities.base64Encode(data.password); // Use proper hashing in production
        
        sheet.appendRow([
            memberId,
            data.full_name,
            data.ic_number || '',
            data.email,
            data.phone,
            data.address || '',
            data.city || '',
            data.state || '',
            data.postcode || '',
            JSON.stringify(data.subjects || []),
            data.tuition_type || 'online',
            timestamp,
            'active',
            passwordHash,
            data.parent_name || '',
            data.parent_phone || '',
            data.parent_email || '',
            JSON.stringify(data.emergency_contact || {}),
            data.school_name || '',
            data.current_level || '',
            timestamp,
            timestamp
        ]);
        
        logToSheet('info', `Member created: ${memberId}`, 'createMember', data.email);
        
        return { 
            success: true, 
            member_id: memberId,
            message: 'Member created successfully'
        };
        
    } catch (error) {
        logToSheet('error', `Create member error: ${error.toString()}`, 'createMember');
        return { success: false, error: error.toString() };
    }
}

function getMember(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.MEMBERS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.member_id || rows[i][3] === data.email) {
                return {
                    success: true,
                    member: {
                        member_id: rows[i][0],
                        full_name: rows[i][1],
                        ic_number: rows[i][2],
                        email: rows[i][3],
                        phone: rows[i][4],
                        address: rows[i][5],
                        city: rows[i][6],
                        state: rows[i][7],
                        postcode: rows[i][8],
                        subjects: JSON.parse(rows[i][9] || '[]'),
                        tuition_type: rows[i][10],
                        enrollment_date: rows[i][11],
                        status: rows[i][12],
                        parent_name: rows[i][14],
                        parent_phone: rows[i][15],
                        parent_email: rows[i][16],
                        emergency_contact: JSON.parse(rows[i][17] || '{}'),
                        school_name: rows[i][18],
                        current_level: rows[i][19]
                    }
                };
            }
        }
        
        return { success: false, message: 'Member not found' };
        
    } catch (error) {
        logToSheet('error', `Get member error: ${error.toString()}`, 'getMember');
        return { success: false, error: error.toString() };
    }
}

function getAllMembers() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.MEMBERS);
        if (!sheet) return { success: true, members: [] };
        
        const rows = sheet.getDataRange().getValues();
        const members = [];
        
        for (let i = 1; i < rows.length; i++) {
            members.push({
                member_id: rows[i][0],
                full_name: rows[i][1],
                email: rows[i][3],
                phone: rows[i][4],
                subjects: JSON.parse(rows[i][9] || '[]'),
                tuition_type: rows[i][10],
                enrollment_date: rows[i][11],
                status: rows[i][12],
                school_name: rows[i][18],
                current_level: rows[i][19]
            });
        }
        
        return { success: true, members: members };
        
    } catch (error) {
        logToSheet('error', `Get all members error: ${error.toString()}`, 'getAllMembers');
        return { success: false, error: error.toString() };
    }
}

function updateMember(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.MEMBERS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.member_id) {
                const row = i + 1;
                
                if (data.full_name) sheet.getRange(row, 2).setValue(data.full_name);
                if (data.phone) sheet.getRange(row, 5).setValue(data.phone);
                if (data.address) sheet.getRange(row, 6).setValue(data.address);
                if (data.city) sheet.getRange(row, 7).setValue(data.city);
                if (data.state) sheet.getRange(row, 8).setValue(data.state);
                if (data.postcode) sheet.getRange(row, 9).setValue(data.postcode);
                if (data.subjects) sheet.getRange(row, 10).setValue(JSON.stringify(data.subjects));
                if (data.tuition_type) sheet.getRange(row, 11).setValue(data.tuition_type);
                if (data.status) sheet.getRange(row, 13).setValue(data.status);
                if (data.school_name) sheet.getRange(row, 19).setValue(data.school_name);
                if (data.current_level) sheet.getRange(row, 20).setValue(data.current_level);
                
                sheet.getRange(row, 22).setValue(new Date()); // updated_at
                
                logToSheet('info', `Member updated: ${data.member_id}`, 'updateMember');
                
                return { success: true, message: 'Member updated successfully' };
            }
        }
        
        return { success: false, message: 'Member not found' };
        
    } catch (error) {
        logToSheet('error', `Update member error: ${error.toString()}`, 'updateMember');
        return { success: false, error: error.toString() };
    }
}

function deleteMember(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.MEMBERS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.member_id) {
                sheet.deleteRow(i + 1);
                
                logToSheet('info', `Member deleted: ${data.member_id}`, 'deleteMember');
                
                return { success: true, message: 'Member deleted successfully' };
            }
        }
        
        return { success: false, message: 'Member not found' };
        
    } catch (error) {
        logToSheet('error', `Delete member error: ${error.toString()}`, 'deleteMember');
        return { success: false, error: error.toString() };
    }
}

function verifyLogin(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.MEMBERS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        const passwordHash = Utilities.base64Encode(data.password);
        
        // Admin check
        if (data.email === 'admin@edusmart.com' && data.password === 'admin123') {
            return { 
                success: true, 
                role: 'admin', 
                member_id: 'ADMIN-001',
                name: 'Administrator'
            };
        }
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][3] === data.email && rows[i][13] === passwordHash) {
                return { 
                    success: true, 
                    role: 'member', 
                    member_id: rows[i][0],
                    name: rows[i][1]
                };
            }
        }
        
        return { success: false, message: 'Invalid credentials' };
        
    } catch (error) {
        logToSheet('error', `Verify login error: ${error.toString()}`, 'verifyLogin');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// PAYMENT CRUD FUNCTIONS
// ============================================

function createPayment(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.PAYMENTS);
            sheet.getRange('1:1').setValues([[
                'payment_id', 'member_id', 'amount', 'payment_date', 
                'transaction_id', 'payment_method', 'status', 'description',
                'package_name', 'subjects', 'receipt_url', 'created_at'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const timestamp = new Date();
        const paymentId = `PAY-${timestamp.getTime()}`;
        
        sheet.appendRow([
            paymentId,
            data.member_id,
            data.amount,
            timestamp,
            data.transaction_id || '',
            data.payment_method || 'ToyibPay',
            'pending',
            data.description || '',
            data.package_name || '',
            JSON.stringify(data.subjects || []),
            '',
            timestamp
        ]);
        
        logToSheet('info', `Payment created: ${paymentId} for member: ${data.member_id}`, 'createPayment');
        
        return { 
            success: true, 
            payment_id: paymentId,
            message: 'Payment created successfully'
        };
        
    } catch (error) {
        logToSheet('error', `Create payment error: ${error.toString()}`, 'createPayment');
        return { success: false, error: error.toString() };
    }
}

function updatePayment(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.payment_id) {
                const row = i + 1;
                
                if (data.status) sheet.getRange(row, 7).setValue(data.status);
                if (data.transaction_id) sheet.getRange(row, 5).setValue(data.transaction_id);
                if (data.receipt_url) sheet.getRange(row, 11).setValue(data.receipt_url);
                
                logToSheet('info', `Payment updated: ${data.payment_id}`, 'updatePayment');
                
                return { success: true, message: 'Payment updated successfully' };
            }
        }
        
        return { success: false, message: 'Payment not found' };
        
    } catch (error) {
        logToSheet('error', `Update payment error: ${error.toString()}`, 'updatePayment');
        return { success: false, error: error.toString() };
    }
}

function getMemberPayments(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
        if (!sheet) return { success: true, payments: [] };
        
        const rows = sheet.getDataRange().getValues();
        const payments = [];
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][1] === data.member_id) {
                payments.push({
                    payment_id: rows[i][0],
                    member_id: rows[i][1],
                    amount: rows[i][2],
                    payment_date: rows[i][3],
                    transaction_id: rows[i][4],
                    payment_method: rows[i][5],
                    status: rows[i][6],
                    description: rows[i][7],
                    package_name: rows[i][8],
                    subjects: JSON.parse(rows[i][9] || '[]'),
                    receipt_url: rows[i][10]
                });
            }
        }
        
        return { success: true, payments: payments };
        
    } catch (error) {
        logToSheet('error', `Get member payments error: ${error.toString()}`, 'getMemberPayments');
        return { success: false, error: error.toString() };
    }
}

function getPayment(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.payment_id) {
                return {
                    success: true,
                    payment: {
                        payment_id: rows[i][0],
                        member_id: rows[i][1],
                        amount: rows[i][2],
                        payment_date: rows[i][3],
                        transaction_id: rows[i][4],
                        payment_method: rows[i][5],
                        status: rows[i][6],
                        description: rows[i][7],
                        package_name: rows[i][8],
                        subjects: JSON.parse(rows[i][9] || '[]'),
                        receipt_url: rows[i][10]
                    }
                };
            }
        }
        
        return { success: false, message: 'Payment not found' };
        
    } catch (error) {
        logToSheet('error', `Get payment error: ${error.toString()}`, 'getPayment');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// TOYIBPAY INTEGRATION
// ============================================

function processToyibPay(data) {
    try {
        // ToyibPay API configuration
        const TOYIBPAY_API_URL = 'https://api.toyibpay.com/v1'; // Replace with actual URL
        const MERCHANT_ID = 'YOUR_MERCHANT_ID'; // Replace with your merchant ID
        const API_KEY = 'YOUR_API_KEY'; // Replace with your API key
        
        // Create payment record first
        const paymentResult = createPayment({
            member_id: data.member_id,
            amount: data.amount,
            description: data.description,
            package_name: data.package_name,
            subjects: data.subjects,
            payment_method: 'ToyibPay'
        });
        
        if (!paymentResult.success) {
            throw new Error('Failed to create payment record');
        }
        
        // Prepare ToyibPay request
        const payload = {
            merchant_id: MERCHANT_ID,
            order_id: paymentResult.payment_id,
            amount: data.amount,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            description: data.description || 'Tuition Fee Payment',
            callback_url: 'https://yourdomain.com/payment-callback',
            redirect_url: 'https://yourdomain.com/payment-success',
            metadata: {
                member_id: data.member_id,
                payment_id: paymentResult.payment_id,
                package: data.package_name
            }
        };
        
        // Make API call to ToyibPay
        const options = {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        };
        
        const response = UrlFetchApp.fetch(`${TOYIBPAY_API_URL}/payment`, options);
        const result = JSON.parse(response.getContentText());
        
        if (result.success) {
            // Update payment with transaction ID
            updatePayment({
                payment_id: paymentResult.payment_id,
                transaction_id: result.transaction_id
            });
            
            logToSheet('info', `ToyibPay payment initiated: ${paymentResult.payment_id}`, 'processToyibPay');
            
            return {
                success: true,
                payment_id: paymentResult.payment_id,
                payment_url: result.payment_url,
                transaction_id: result.transaction_id
            };
        } else {
            throw new Error(result.message || 'ToyibPay payment failed');
        }
        
    } catch (error) {
        logToSheet('error', `ToyibPay processing error: ${error.toString()}`, 'processToyibPay');
        return { success: false, error: error.toString() };
    }
}

function verifyToyibPay(data) {
    try {
        const TOYIBPAY_API_URL = 'https://api.toyibpay.com/v1';
        const API_KEY = 'YOUR_API_KEY';
        
        const options = {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            muteHttpExceptions: true
        };
        
        const response = UrlFetchApp.fetch(`${TOYIBPAY_API_URL}/payment/${data.transaction_id}/status`, options);
        const result = JSON.parse(response.getContentText());
        
        if (result.success) {
            // Update payment status
            updatePayment({
                payment_id: data.payment_id,
                status: result.status,
                transaction_id: data.transaction_id
            });
            
            return {
                success: true,
                status: result.status,
                details: result
            };
        }
        
        return { success: false, message: 'Payment verification failed' };
        
    } catch (error) {
        logToSheet('error', `ToyibPay verification error: ${error.toString()}`, 'verifyToyibPay');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// CALENDAR EVENT FUNCTIONS
// ============================================

function createCalendarEvent(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.CALENDAR);
            sheet.getRange('1:1').setValues([[
                'event_id', 'title', 'subject', 'teacher_id', 'type', 
                'start_datetime', 'end_datetime', 'location', 'students',
                'max_students', 'description', 'materials', 'recurring',
                'repeat_until', 'repeat_days', 'status', 'created_by',
                'created_at', 'updated_at'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const timestamp = new Date();
        const eventId = `EVT-${timestamp.getTime()}`;
        
        sheet.appendRow([
            eventId,
            data.title,
            data.subject,
            data.teacher_id,
            data.type,
            data.start,
            data.end,
            JSON.stringify(data.location || {}),
            JSON.stringify(data.students || []),
            data.max_students || 10,
            data.description || '',
            data.materials || '',
            data.recurring || false,
            data.repeat_until || '',
            JSON.stringify(data.repeat_days || []),
            'scheduled',
            data.created_by || 'system',
            timestamp,
            timestamp
        ]);
        
        logToSheet('info', `Calendar event created: ${eventId}`, 'createCalendarEvent');
        
        return { 
            success: true, 
            event_id: eventId,
            message: 'Event created successfully'
        };
        
    } catch (error) {
        logToSheet('error', `Create calendar event error: ${error.toString()}`, 'createCalendarEvent');
        return { success: false, error: error.toString() };
    }
}

function getCalendarEvents(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR);
        if (!sheet) return { success: true, events: [] };
        
        const rows = sheet.getDataRange().getValues();
        const events = [];
        
        for (let i = 1; i < rows.length; i++) {
            const event = {
                id: rows[i][0],
                title: rows[i][1],
                subject: rows[i][2],
                teacher_id: rows[i][3],
                type: rows[i][4],
                start: rows[i][5],
                end: rows[i][6],
                location: JSON.parse(rows[i][7] || '{}'),
                students: JSON.parse(rows[i][8] || '[]'),
                max_students: rows[i][9],
                description: rows[i][10],
                materials: rows[i][11],
                recurring: rows[i][12],
                repeat_until: rows[i][13],
                repeat_days: JSON.parse(rows[i][14] || '[]'),
                status: rows[i][15]
            };
            
            // Apply filters
            if (data) {
                if (data.teacher_id && event.teacher_id !== data.teacher_id) continue;
                if (data.subject && event.subject !== data.subject) continue;
                if (data.type && event.type !== data.type) continue;
                if (data.student_id && !event.students.includes(data.student_id)) continue;
                if (data.start_date && data.end_date) {
                    const eventStart = new Date(event.start);
                    const filterStart = new Date(data.start_date);
                    const filterEnd = new Date(data.end_date);
                    if (eventStart < filterStart || eventStart > filterEnd) continue;
                }
            }
            
            events.push(event);
        }
        
        return { success: true, events: events };
        
    } catch (error) {
        logToSheet('error', `Get calendar events error: ${error.toString()}`, 'getCalendarEvents');
        return { success: false, error: error.toString() };
    }
}

function updateCalendarEvent(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.event_id) {
                const row = i + 1;
                
                if (data.title) sheet.getRange(row, 2).setValue(data.title);
                if (data.subject) sheet.getRange(row, 3).setValue(data.subject);
                if (data.teacher_id) sheet.getRange(row, 4).setValue(data.teacher_id);
                if (data.type) sheet.getRange(row, 5).setValue(data.type);
                if (data.start) sheet.getRange(row, 6).setValue(data.start);
                if (data.end) sheet.getRange(row, 7).setValue(data.end);
                if (data.location) sheet.getRange(row, 8).setValue(JSON.stringify(data.location));
                if (data.students) sheet.getRange(row, 9).setValue(JSON.stringify(data.students));
                if (data.max_students) sheet.getRange(row, 10).setValue(data.max_students);
                if (data.description) sheet.getRange(row, 11).setValue(data.description);
                if (data.materials) sheet.getRange(row, 12).setValue(data.materials);
                if (data.status) sheet.getRange(row, 16).setValue(data.status);
                
                sheet.getRange(row, 19).setValue(new Date()); // updated_at
                
                logToSheet('info', `Calendar event updated: ${data.event_id}`, 'updateCalendarEvent');
                
                return { success: true, message: 'Event updated successfully' };
            }
        }
        
        return { success: false, message: 'Event not found' };
        
    } catch (error) {
        logToSheet('error', `Update calendar event error: ${error.toString()}`, 'updateCalendarEvent');
        return { success: false, error: error.toString() };
    }
}

function deleteCalendarEvent(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        if (data.delete_all && data.series_id) {
            // Delete all recurring events
            const rows = sheet.getDataRange().getValues();
            for (let i = rows.length - 1; i >= 1; i--) {
                if (rows[i][0].startsWith(data.series_id)) {
                    sheet.deleteRow(i + 1);
                }
            }
        } else {
            // Delete single event
            const rows = sheet.getDataRange().getValues();
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][0] === data.event_id) {
                    sheet.deleteRow(i + 1);
                    break;
                }
            }
        }
        
        logToSheet('info', `Calendar event deleted: ${data.event_id}`, 'deleteCalendarEvent');
        
        return { success: true, message: 'Event deleted successfully' };
        
    } catch (error) {
        logToSheet('error', `Delete calendar event error: ${error.toString()}`, 'deleteCalendarEvent');
        return { success: false, error: error.toString() };
    }
}

function checkScheduleConflicts(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR);
        if (!sheet) return { success: true, hasConflicts: false, conflicts: [] };
        
        const rows = sheet.getDataRange().getValues();
        const conflicts = [];
        const newStart = new Date(data.start);
        const newEnd = new Date(data.end);
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.event_id) continue; // Skip self
            
            const existingStart = new Date(rows[i][5]);
            const existingEnd = new Date(rows[i][6]);
            
            // Check for overlap
            if (newStart < existingEnd && newEnd > existingStart) {
                // Check teacher conflict
                if (rows[i][3] === data.teacher_id) {
                    conflicts.push({
                        type: 'teacher',
                        event: {
                            id: rows[i][0],
                            title: rows[i][1],
                            start: rows[i][5],
                            end: rows[i][6]
                        }
                    });
                }
                
                // Check student conflicts
                const existingStudents = JSON.parse(rows[i][8] || '[]');
                const newStudents = data.students || [];
                const commonStudents = existingStudents.filter(s => newStudents.includes(s));
                
                if (commonStudents.length > 0) {
                    conflicts.push({
                        type: 'student',
                        students: commonStudents,
                        event: {
                            id: rows[i][0],
                            title: rows[i][1],
                            start: rows[i][5],
                            end: rows[i][6]
                        }
                    });
                }
            }
        }
        
        return { 
            success: true, 
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts 
        };
        
    } catch (error) {
        logToSheet('error', `Check schedule conflicts error: ${error.toString()}`, 'checkScheduleConflicts');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// TEACHERS AND STUDENTS FUNCTIONS
// ============================================

function getTeachers() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.TEACHERS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.TEACHERS);
            sheet.getRange('1:1').setValues([[
                'teacher_id', 'name', 'email', 'phone', 'subjects', 
                'qualification', 'experience', 'status', 'photo_url'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
            
            // Add sample teachers
            const sampleTeachers = [
                ['T001', 'Dr. Sarah Johnson', 'sarah@edusmart.com', '0123456789', 
                 JSON.stringify(['mathematics', 'physics']), 'PhD Mathematics', '10 years', 'active', ''],
                ['T002', 'Mr. Ahmad Faiz', 'ahmad@edusmart.com', '0123456790', 
                 JSON.stringify(['science', 'biology']), 'MSc Biology', '8 years', 'active', ''],
                ['T003', 'Ms. Lim Xiao Mei', 'lim@edusmart.com', '0123456791', 
                 JSON.stringify(['english', 'malay']), 'BA English', '6 years', 'active', '']
            ];
            
            if (sampleTeachers.length > 0) {
                sheet.getRange(2, 1, sampleTeachers.length, sampleTeachers[0].length).setValues(sampleTeachers);
            }
        }
        
        const rows = sheet.getDataRange().getValues();
        const teachers = [];
        
        for (let i = 1; i < rows.length; i++) {
            teachers.push({
                id: rows[i][0],
                name: rows[i][1],
                email: rows[i][2],
                phone: rows[i][3],
                subjects: JSON.parse(rows[i][4] || '[]'),
                qualification: rows[i][5],
                experience: rows[i][6],
                status: rows[i][7],
                photo: rows[i][8]
            });
        }
        
        return { success: true, teachers: teachers };
        
    } catch (error) {
        logToSheet('error', `Get teachers error: ${error.toString()}`, 'getTeachers');
        return { success: false, error: error.toString() };
    }
}

function getStudents() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.STUDENTS);
            sheet.getRange('1:1').setValues([[
                'student_id', 'name', 'ic_number', 'email', 'phone',
                'school', 'level', 'subjects', 'parent_name', 'parent_phone',
                'status', 'enrollment_date'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const rows = sheet.getDataRange().getValues();
        const students = [];
        
        for (let i = 1; i < rows.length; i++) {
            students.push({
                id: rows[i][0],
                name: rows[i][1],
                ic: rows[i][2],
                email: rows[i][3],
                phone: rows[i][4],
                school: rows[i][5],
                level: rows[i][6],
                subjects: JSON.parse(rows[i][7] || '[]'),
                parent_name: rows[i][8],
                parent_phone: rows[i][9],
                status: rows[i][10],
                enrollment_date: rows[i][11]
            });
        }
        
        return { success: true, students: students };
        
    } catch (error) {
        logToSheet('error', `Get students error: ${error.toString()}`, 'getStudents');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// SUBJECTS AND PRICING FUNCTIONS
// ============================================

function getSubjects() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.SUBJECTS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.SUBJECTS);
            sheet.getRange('1:1').setValues([[
                'subject_id', 'name', 'code', 'level', 'base_price',
                'description', 'is_active', 'created_at'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
            
            // Add sample subjects
            const sampleSubjects = [
                ['SUBJ001', 'Mathematics', 'MATH', 'all', 150, 'Core mathematics', true, new Date()],
                ['SUBJ002', 'Science', 'SCI', 'all', 150, 'General science', true, new Date()],
                ['SUBJ003', 'English', 'ENG', 'all', 140, 'English language', true, new Date()],
                ['SUBJ004', 'Bahasa Malaysia', 'BM', 'all', 140, 'Malay language', true, new Date()],
                ['SUBJ005', 'Physics', 'PHY', 'upper', 160, 'Physics for Form 4-5', true, new Date()],
                ['SUBJ006', 'Chemistry', 'CHEM', 'upper', 160, 'Chemistry for Form 4-5', true, new Date()],
                ['SUBJ007', 'Biology', 'BIO', 'upper', 160, 'Biology for Form 4-5', true, new Date()]
            ];
            
            if (sampleSubjects.length > 0) {
                sheet.getRange(2, 1, sampleSubjects.length, sampleSubjects[0].length).setValues(sampleSubjects);
            }
        }
        
        const rows = sheet.getDataRange().getValues();
        const subjects = [];
        
        for (let i = 1; i < rows.length; i++) {
            subjects.push({
                id: rows[i][0],
                name: rows[i][1],
                code: rows[i][2],
                level: rows[i][3],
                base_price: rows[i][4],
                description: rows[i][5],
                is_active: rows[i][6]
            });
        }
        
        return { success: true, subjects: subjects };
        
    } catch (error) {
        logToSheet('error', `Get subjects error: ${error.toString()}`, 'getSubjects');
        return { success: false, error: error.toString() };
    }
}

function getPricing(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.PRICING);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.PRICING);
            sheet.getRange('1:1').setValues([[
                'package_id', 'level', 'name', 'subjects_count', 'price',
                'features', 'is_popular', 'is_active'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
            
            // Add sample pricing
            const samplePricing = [
                ['P001', 'primary', 'Single Subject', 1, 100, JSON.stringify(['basic']), false, true],
                ['P002', 'primary', '2 Subjects Package', 2, 140, JSON.stringify(['basic', 'report']), true, true],
                ['P003', 'primary', '3 Subjects Package', 3, 180, JSON.stringify(['basic', 'report', 'recordings']), false, true],
                ['P004', 'primary', '4 Subjects Package', 4, 200, JSON.stringify(['basic', 'report', 'recordings', 'assessment']), false, true],
                ['P005', 'lower', 'Single Subject', 1, 100, JSON.stringify(['basic']), false, true],
                ['P006', 'lower', '2 Subjects Package', 2, 160, JSON.stringify(['basic', 'report']), false, true],
                ['P007', 'lower', '3 Subjects Package', 3, 190, JSON.stringify(['basic', 'report', 'recordings']), true, true],
                ['P008', 'lower', '4 Subjects Package', 4, 200, JSON.stringify(['basic', 'report', 'recordings', 'assessment']), false, true],
                ['P009', 'upper', 'Package E', 2, 150, JSON.stringify(['basic']), false, true],
                ['P010', 'upper', 'Package A', 3, 180, JSON.stringify(['basic', 'report']), false, true],
                ['P011', 'upper', 'Package B', 4, 200, JSON.stringify(['basic', 'report', 'recordings']), true, true],
                ['P012', 'upper', 'Package C', 5, 250, JSON.stringify(['basic', 'report', 'recordings', 'assessment']), false, true],
                ['P013', 'upper', 'Package D', 6, 300, JSON.stringify(['basic', 'report', 'recordings', 'assessment', 'tutoring']), false, true]
            ];
            
            if (samplePricing.length > 0) {
                sheet.getRange(2, 1, samplePricing.length, samplePricing[0].length).setValues(samplePricing);
            }
        }
        
        const rows = sheet.getDataRange().getValues();
        const pricing = [];
        
        for (let i = 1; i < rows.length; i++) {
            if (data && data.level && rows[i][1] !== data.level) continue;
            
            pricing.push({
                id: rows[i][0],
                level: rows[i][1],
                name: rows[i][2],
                subjects_count: rows[i][3],
                price: rows[i][4],
                features: JSON.parse(rows[i][5] || '[]'),
                is_popular: rows[i][6],
                is_active: rows[i][7]
            });
        }
        
        return { success: true, pricing: pricing };
        
    } catch (error) {
        logToSheet('error', `Get pricing error: ${error.toString()}`, 'getPricing');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

function submitEnrollment(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.ENROLLMENTS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.ENROLLMENTS);
            sheet.getRange('1:1').setValues([[
                'enrollment_id', 'student_data', 'parent_data', 'academic_data',
                'payment_data', 'status', 'submitted_at', 'processed_at', 'notes'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const timestamp = new Date();
        const enrollmentId = `ENR-${timestamp.getTime()}`;
        
        sheet.appendRow([
            enrollmentId,
            JSON.stringify(data.student || {}),
            JSON.stringify(data.parent || {}),
            JSON.stringify(data.academic || {}),
            JSON.stringify(data.payment || {}),
            'pending',
            timestamp,
            '',
            ''
        ]);
        
        // Create member record
        const memberResult = createMember({
            full_name: data.student.fullName,
            email: data.student.email,
            phone: data.student.phone,
            ic_number: data.student.ic,
            address: data.student.address,
            city: data.student.city,
            state: data.student.state,
            postcode: data.student.postcode,
            subjects: data.academic.subjects,
            current_level: data.academic.level,
            school_name: data.academic.school.name,
            parent_name: data.parent.father?.name || data.parent.mother?.name,
            parent_phone: data.parent.father?.phone || data.parent.mother?.phone,
            parent_email: data.parent.father?.email || data.parent.mother?.email,
            emergency_contact: data.parent.emergency,
            password: 'temporary123' // Should generate random password
        });
        
        logToSheet('info', `Enrollment submitted: ${enrollmentId}`, 'submitEnrollment', data.student?.email);
        
        return { 
            success: true, 
            enrollment_id: enrollmentId,
            member_id: memberResult.member_id,
            message: 'Enrollment submitted successfully'
        };
        
    } catch (error) {
        logToSheet('error', `Submit enrollment error: ${error.toString()}`, 'submitEnrollment');
        return { success: false, error: error.toString() };
    }
}

function getEnrollment(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.ENROLLMENTS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.enrollment_id) {
                return {
                    success: true,
                    enrollment: {
                        id: rows[i][0],
                        student: JSON.parse(rows[i][1] || '{}'),
                        parent: JSON.parse(rows[i][2] || '{}'),
                        academic: JSON.parse(rows[i][3] || '{}'),
                        payment: JSON.parse(rows[i][4] || '{}'),
                        status: rows[i][5],
                        submitted_at: rows[i][6],
                        processed_at: rows[i][7],
                        notes: rows[i][8]
                    }
                };
            }
        }
        
        return { success: false, message: 'Enrollment not found' };
        
    } catch (error) {
        logToSheet('error', `Get enrollment error: ${error.toString()}`, 'getEnrollment');
        return { success: false, error: error.toString() };
    }
}

function updateEnrollment(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.ENROLLMENTS);
        if (!sheet) return { success: false, message: 'Sheet not found' };
        
        const rows = sheet.getDataRange().getValues();
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.enrollment_id) {
                const row = i + 1;
                
                if (data.status) sheet.getRange(row, 6).setValue(data.status);
                if (data.processed_at) sheet.getRange(row, 7).setValue(data.processed_at);
                if (data.notes) sheet.getRange(row, 8).setValue(data.notes);
                
                if (data.status === 'approved') {
                    // Send approval email
                    sendEnrollmentEmail(data.enrollment_id, 'approved');
                }
                
                logToSheet('info', `Enrollment updated: ${data.enrollment_id}`, 'updateEnrollment');
                
                return { success: true, message: 'Enrollment updated successfully' };
            }
        }
        
        return { success: false, message: 'Enrollment not found' };
        
    } catch (error) {
        logToSheet('error', `Update enrollment error: ${error.toString()}`, 'updateEnrollment');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

function markAttendance(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.ATTENDANCE);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.ATTENDANCE);
            sheet.getRange('1:1').setValues([[
                'attendance_id', 'event_id', 'student_id', 'status',
                'check_in_time', 'check_out_time', 'notes', 'marked_by'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const timestamp = new Date();
        const attendanceId = `ATT-${timestamp.getTime()}`;
        
        sheet.appendRow([
            attendanceId,
            data.event_id,
            data.student_id,
            data.status || 'present',
            data.check_in_time || timestamp,
            data.check_out_time || '',
            data.notes || '',
            data.marked_by || 'system'
        ]);
        
        logToSheet('info', `Attendance marked: ${attendanceId} for student: ${data.student_id}`, 'markAttendance');
        
        return { 
            success: true, 
            attendance_id: attendanceId,
            message: 'Attendance marked successfully'
        };
        
    } catch (error) {
        logToSheet('error', `Mark attendance error: ${error.toString()}`, 'markAttendance');
        return { success: false, error: error.toString() };
    }
}

function getStudentAttendance(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.ATTENDANCE);
        if (!sheet) return { success: true, attendance: [] };
        
        const rows = sheet.getDataRange().getValues();
        const attendance = [];
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][2] === data.student_id) {
                attendance.push({
                    id: rows[i][0],
                    event_id: rows[i][1],
                    student_id: rows[i][2],
                    status: rows[i][3],
                    check_in: rows[i][4],
                    check_out: rows[i][5],
                    notes: rows[i][6]
                });
            }
        }
        
        // Calculate statistics
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        
        return {
            success: true,
            attendance: attendance,
            stats: {
                total: total,
                present: present,
                absent: absent,
                late: late,
                percentage: total > 0 ? (present / total * 100).toFixed(2) : 0
            }
        };
        
    } catch (error) {
        logToSheet('error', `Get student attendance error: ${error.toString()}`, 'getStudentAttendance');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// CHATBOT FUNCTIONS
// ============================================

function handleChatRequest(data) {
    try {
        const message = data.message;
        const context = data.context || {};
        const sessionId = data.sessionId || `session_${new Date().getTime()}`;
        
        // Store message
        storeChatMessage(sessionId, message, 'user', context);
        
        // Generate response
        const response = generateChatResponse(message, context);
        
        // Store bot response
        storeChatMessage(sessionId, response.text, 'bot', context);
        
        return {
            success: true,
            text: response.text,
            intent: response.intent,
            suggestions: response.suggestions || []
        };
        
    } catch (error) {
        logToSheet('error', `Chat request error: ${error.toString()}`, 'handleChatRequest');
        return {
            success: false,
            text: 'Sorry, I encountered an error. Please try again.',
            error: error.toString()
        };
    }
}

function storeChatMessage(sessionId, message, sender, context) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.CHAT_HISTORY);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.CHAT_HISTORY);
            sheet.getRange('1:1').setValues([[
                'timestamp', 'session_id', 'sender', 'message', 'context'
            ]]);
        }
        
        sheet.appendRow([
            new Date(),
            sessionId,
            sender,
            message,
            JSON.stringify(context)
        ]);
        
    } catch (error) {
        console.error('Failed to store chat message:', error);
    }
}

function generateChatResponse(message, context) {
    const lowerMsg = message.toLowerCase();
    const lang = context.language || 'en';
    
    // Check for keywords
    if (lowerMsg.includes('price') || lowerMsg.includes('fee') || lowerMsg.includes('cost') || lowerMsg.includes('package')) {
        return {
            text: getPricingResponse(lang),
            intent: 'pricing',
            suggestions: ['Form 4 packages', 'Form 5 packages', 'Primary school', 'Discounts']
        };
    }
    
    if (lowerMsg.includes('enroll') || lowerMsg.includes('register') || lowerMsg.includes('sign up')) {
        return {
            text: getEnrollmentResponse(lang),
            intent: 'enrollment',
            suggestions: ['enrollment form', 'requirements', 'documents needed', 'next intake']
        };
    }
    
    if (lowerMsg.includes('schedule') || lowerMsg.includes('class') || lowerMsg.includes('time') || lowerMsg.includes('when')) {
        return {
            text: getScheduleResponse(lang, context.userId),
            intent: 'schedule',
            suggestions: ['view calendar', 'class timings', 'holidays', 'make-up class']
        };
    }
    
    if (lowerMsg.includes('pay') || lowerMsg.includes('payment') || lowerMsg.includes('toyibpay') || lowerMsg.includes('fpx')) {
        return {
            text: getPaymentResponse(lang),
            intent: 'payment',
            suggestions: ['ToyibPay', 'installment', 'receipt', 'payment history']
        };
    }
    
    if (lowerMsg.includes('subject') || lowerMsg.includes('math') || lowerMsg.includes('science') || lowerMsg.includes('english')) {
        return {
            text: getSubjectsResponse(lang),
            intent: 'subjects',
            suggestions: ['Mathematics', 'Science', 'English', 'Additional Mathematics']
        };
    }
    
    if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email') || lowerMsg.includes('call')) {
        return {
            text: getContactResponse(lang),
            intent: 'contact',
            suggestions: ['call us', 'email us', 'visit center', 'WhatsApp']
        };
    }
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        return {
            text: getGreetingResponse(lang, context.userName),
            intent: 'greeting',
            suggestions: ['View packages', 'Enrollment info', 'Contact support']
        };
    }
    
    // Default response
    return {
        text: getDefaultResponse(lang),
        intent: 'unknown',
        suggestions: ['View packages', 'Enroll now', 'Contact support', 'FAQ']
    };
}

function getPricingResponse(lang) {
    const responses = {
        en: "Here are our tuition packages:\n\n📚 Form 4-5:\n• Package E (2 subjects): RM150/month\n• Package A (3 subjects): RM180/month\n• Package B (4 subjects): RM200/month\n• Package C (5 subjects): RM250/month\n• Package D (All subjects + 1-on-1): RM300/month\n\n📚 Form 1-3:\n• 1 subject: RM100/month\n• 2 subjects: RM160/month\n• 3 subjects: RM190/month\n• 4 subjects: RM200/month\n\n📚 Year 3-6:\n• 1 subject: RM100/month\n• 2 subjects: RM140/month\n• 3 subjects: RM180/month\n• 4 subjects: RM200/month\n\nWould you like to know more about any specific package?",
        
        ms: "Inilah pakej tuisyen kami:\n\n📚 Tingkatan 4-5:\n• Pakej E (2 subjek): RM150/bulan\n• Pakej A (3 subjek): RM180/bulan\n• Pakej B (4 subjek): RM200/bulan\n• Pakej C (5 subjek): RM250/bulan\n• Pakej D (Semua subjek + 1-on-1): RM300/bulan\n\n📚 Tingkatan 1-3:\n• 1 subjek: RM100/bulan\n• 2 subjek: RM160/bulan\n• 3 subjek: RM190/bulan\n• 4 subjek: RM200/bulan\n\n📚 Tahun 3-6:\n• 1 subjek: RM100/bulan\n• 2 subjek: RM140/bulan\n• 3 subjek: RM180/bulan\n• 4 subjek: RM200/bulan\n\nAdakah anda ingin tahu lebih lanjut tentang pakej tertentu?",
        
        zh: "以下是我们的辅导配套：\n\n📚 中四至中五：\n• 配套 E (2科): 每月RM150\n• 配套 A (3科): 每月RM180\n• 配套 B (4科): 每月RM200\n• 配套 C (5科): 每月RM250\n• 配套 D (全部科目 + 一对一): 每月RM300\n\n📚 中一至中三：\n• 1科: 每月RM100\n• 2科: 每月RM160\n• 3科: 每月RM190\n• 4科: 每月RM200\n\n📚 三至六年级：\n• 1科: 每月RM100\n• 2科: 每月RM140\n• 3科: 每月RM180\n• 4科: 每月RM200\n\n想了解某个配套的更多详情吗？"
    };
    return responses[lang] || responses.en;
}

function getEnrollmentResponse(lang) {
    const responses = {
        en: "To enroll at EduSmart, please follow these steps:\n\n1️⃣ Click on the 'Enroll Now' button on our website\n2️⃣ Fill in student and parent information\n3️⃣ Select your preferred subjects and package\n4️⃣ Choose your payment method\n5️⃣ Complete the payment to confirm enrollment\n\nYou'll need:\n• Student's IC/Passport\n• Recent report card\n• Parent/Guardian details\n\nClick here to enroll now: [Enroll Now](/enrollment.html)\n\nWould you like me to help with anything specific about enrollment?",
        
        ms: "Untuk mendaftar di EduSmart, sila ikut langkah-langkah ini:\n\n1️⃣ Klik butang 'Daftar Sekarang' di laman web kami\n2️⃣ Isi maklumat pelajar dan ibu bapa\n3️⃣ Pilih subjek dan pakej yang diingini\n4️⃣ Pilih kaedah pembayaran\n5️⃣ Selesaikan pembayaran untuk mengesahkan pendaftaran\n\nAnda perlukan:\n• IC/Pasport pelajar\n• Kad laporan terkini\n• Maklumat ibu bapa/penjaga\n\nKlik di sini untuk mendaftar sekarang: [Daftar Sekarang](/enrollment.html)\n\nAda perkara khusus tentang pendaftaran yang saya boleh bantu?",
        
        zh: "要在EduSmart报名，请按照以下步骤操作：\n\n1️⃣ 点击网站上的'立即报名'按钮\n2️⃣ 填写学生和家长信息\n3️⃣ 选择您想要的科目和配套\n4️⃣ 选择付款方式\n5️⃣ 完成付款以确认报名\n\n需要准备：\n• 学生身份证/护照\n• 近期成绩单\n• 家长/监护人资料\n\n点击此处立即报名：[立即报名](/enrollment.html)\n\n关于报名有什么具体问题需要我帮助吗？"
    };
    return responses[lang] || responses.en;
}

function getScheduleResponse(lang, userId) {
    if (userId) {
        return "You can view your personalized schedule on your dashboard. Would you like me to take you there?";
    }
    return "You can view our class schedules on the Calendar page. Would you like to know about class timings for specific subjects?";
}

function getPaymentResponse(lang) {
    const responses = {
        en: "We accept multiple payment methods:\n\n💳 ToyibPay - Online banking and credit/debit cards\n🏦 FPX - Direct bank transfer\n💳 Credit/Debit cards (Visa, Mastercard)\n📱 0% Installment plans (3, 6, or 12 months)\n\nAll payments are secure and processed immediately. You'll receive a receipt via email after successful payment.\n\nWould you like help with making a payment?",
        
        ms: "Kami menerima pelbagai kaedah pembayaran:\n\n💳 ToyibPay - Perbankan dalam talian dan kad kredit/debit\n🏦 FPX - Pindahan bank terus\n💳 Kad kredit/debit (Visa, Mastercard)\n📱 Pelan ansuran 0% (3, 6, atau 12 bulan)\n\nSemua pembayaran adalah selamat dan diproses segera. Anda akan menerima resit melalui e-mel selepas pembayaran berjaya.\n\nPerlu bantuan dengan pembayaran?",
        
        zh: "我们接受多种付款方式：\n\n💳 ToyibPay - 网上银行和信用卡/借记卡\n🏦 FPX - 直接银行转账\n💳 信用卡/借记卡（Visa、Mastercard）\n📱 0%分期付款计划（3、6或12个月）\n\n所有付款都是安全的，并立即处理。付款成功后，您将通过电子邮件收到收据。\n\n需要帮助付款吗？"
    };
    return responses[lang] || responses.en;
}

function getSubjectsResponse(lang) {
    const responses = {
        en: "We offer all secondary school subjects including:\n\n📐 Mathematics & Additional Mathematics\n🔬 Science, Physics, Chemistry, Biology\n📝 English, Bahasa Malaysia, Mandarin\n🌍 History & Geography\n💰 Accounting & Economics\n💼 Business Studies\n\nAll subjects are taught by experienced, certified teachers. You can choose any combination of subjects based on your needs.\n\nWhich subject are you interested in?",
        
        ms: "Kami menawarkan semua subjek sekolah menengah termasuk:\n\n📐 Matematik & Matematik Tambahan\n🔬 Sains, Fizik, Kimia, Biologi\n📝 Bahasa Inggeris, Bahasa Malaysia, Mandarin\n🌍 Sejarah & Geografi\n💰 Perakaunan & Ekonomi\n💼 Pengajian Perniagaan\n\nSemua subjek diajar oleh guru berpengalaman dan bertauliah. Anda boleh memilih sebarang kombinasi subjek berdasarkan keperluan anda.\n\nSubjek mana yang anda minati?",
        
        zh: "我们提供所有中学科目，包括：\n\n📐 数学与高级数学\n🔬 科学、物理、化学、生物\n📝 英语、马来语、华语\n🌍 历史与地理\n💰 会计与经济学\n💼 商业研究\n\n所有科目均由经验丰富的认证教师授课。您可以根据需要选择任何科目组合。\n\n您对哪个科目感兴趣？"
    };
    return responses[lang] || responses.en;
}

function getContactResponse(lang) {
    const responses = {
        en: "You can reach us through:\n\n📞 Phone: +603-1234 5678\n📧 Email: info@edusmart.com\n📍 Visit: Kuala Lumpur, Malaysia\n💬 WhatsApp: +6012-345 6789\n\nOur office hours:\nMonday - Friday: 9:00 AM - 9:00 PM\nSaturday - Sunday: 9:00 AM - 6:00 PM\n\nWould you like me to connect you with a human representative?",
        
        ms: "Anda boleh hubungi kami melalui:\n\n📞 Telefon: +603-1234 5678\n📧 E-mel: info@edusmart.com\n📍 Kunjungi: Kuala Lumpur, Malaysia\n💬 WhatsApp: +6012-345 6789\n\nWaktu pejabat kami:\nIsnin - Jumaat: 9:00 PG - 9:00 MLM\nSabtu - Ahad: 9:00 PG - 6:00 PTG\n\nAdakah anda mahu saya sambungkan dengan wakil manusia?",
        
        zh: "您可以通过以下方式联系我们：\n\n📞 电话：+603-1234 5678\n📧 邮箱：info@edusmart.com\n📍 地址：马来西亚吉隆坡\n💬 WhatsApp：+6012-345 6789\n\n我们的办公时间：\n周一至周五：上午9:00 - 晚上9:00\n周六至周日：上午9:00 - 下午6:00\n\n需要我为您连接人工客服吗？"
    };
    return responses[lang] || responses.en;
}

function getGreetingResponse(lang, userName) {
    const name = userName ? ` ${userName}` : '';
    
    const responses = {
        en: `Hello${name}! 👋 Welcome to EduSmart Tuition. I'm your AI assistant. How can I help you today? You can ask me about:\n\n📚 Tuition packages and pricing\n📝 Enrollment process\n📅 Class schedules\n💳 Payment methods\n📖 Subjects offered\n\nOr just type your question!`,
        
        ms: `Assalamualaikum${name}! 👋 Selamat datang ke Tuisyen EduSmart. Saya pembantu AI anda. Ada apa yang saya boleh bantu hari ini? Anda boleh tanya tentang:\n\n📚 Pakej tuisyen dan harga\n📝 Proses pendaftaran\n📅 Jadual kelas\n💳 Kaedah pembayaran\n📖 Subjek yang ditawarkan\n\nAtau taip soalan anda!`,
        
        zh: `您好${name}！👋 欢迎来到EduSmart辅导中心。我是您的AI助手。今天有什么可以帮您的吗？您可以询问：\n\n📚 辅导配套和价格\n📝 报名流程\n📅 课程安排\n💳 付款方式\n📖 提供的科目\n\n或者直接输入您的问题！`
    };
    return responses[lang] || responses.en;
}

function getDefaultResponse(lang) {
    const responses = {
        en: "I understand you need assistance. Could you please provide more details? You can ask me about:\n\n• Tuition packages and prices\n• How to enroll\n• Class schedules\n• Payment methods\n• Subjects available\n• Contact information\n\nOr choose from the quick replies below!",
        
        ms: "Saya faham anda perlukan bantuan. Boleh berikan maklumat lanjut? Anda boleh tanya tentang:\n\n• Pakej tuisyen dan harga\n• Cara mendaftar\n• Jadual kelas\n• Kaedah pembayaran\n• Subjek yang ada\n• Maklumat hubungan\n\nAtau pilih dari jawapan cepat di bawah!",
        
        zh: "我理解您需要帮助。能否提供更多详细信息？您可以询问：\n\n• 辅导配套和价格\n• 如何报名\n• 课程安排\n• 付款方式\n• 可用科目\n• 联系信息\n\n或者从下面的快速回复中选择！"
    };
    return responses[lang] || responses.en;
}

function handleFeedback(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.CHAT_FEEDBACK);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.CHAT_FEEDBACK);
            sheet.getRange('1:1').setValues([[
                'timestamp', 'session_id', 'rating', 'feedback', 'user_id', 'context'
            ]]);
        }
        
        sheet.appendRow([
            new Date(),
            data.sessionId,
            data.rating,
            data.feedback,
            data.userId || 'anonymous',
            JSON.stringify(data.context || {})
        ]);
        
        return { success: true };
        
    } catch (error) {
        logToSheet('error', `Handle feedback error: ${error.toString()}`, 'handleFeedback');
        return { success: false, error: error.toString() };
    }
}

function handleEscalation(data) {
    try {
        const adminEmail = 'admin@edusmart.com';
        const subject = `🚨 Chatbot Escalation Required - Session ${data.sessionId}`;
        
        const body = `
            <h2>Chatbot Escalation Request</h2>
            <p><strong>Time:</strong> ${new Date()}</p>
            <p><strong>Session ID:</strong> ${data.sessionId}</p>
            <p><strong>User ID:</strong> ${data.userId || 'Anonymous'}</p>
            <p><strong>User Message:</strong> ${data.message}</p>
            <p><strong>Context:</strong></p>
            <pre>${JSON.stringify(data.context, null, 2)}</pre>
            <p><strong>Chat History:</strong></p>
            <pre>${JSON.stringify(data.history, null, 2)}</pre>
            <p>Please respond to this user as soon as possible.</p>
        `;
        
        MailApp.sendEmail({
            to: adminEmail,
            subject: subject,
            htmlBody: body
        });
        
        return {
            success: true,
            message: "A support representative has been notified and will contact you shortly."
        };
        
    } catch (error) {
        logToSheet('error', `Handle escalation error: ${error.toString()}`, 'handleEscalation');
        return { success: false, error: error.toString() };
    }
}

function getChatHistory(data) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.CHAT_HISTORY);
        if (!sheet) return { success: true, history: [] };
        
        const rows = sheet.getDataRange().getValues();
        const history = [];
        
        for (let i = 1; i < rows.length; i++) {
            if (!data.sessionId || rows[i][1] === data.sessionId) {
                history.push({
                    timestamp: rows[i][0],
                    sessionId: rows[i][1],
                    sender: rows[i][2],
                    message: rows[i][3],
                    context: JSON.parse(rows[i][4] || '{}')
                });
            }
        }
        
        return { success: true, history: history };
        
    } catch (error) {
        logToSheet('error', `Get chat history error: ${error.toString()}`, 'getChatHistory');
        return { success: false, error: error.toString() };
    }
}

function getChatbotAnalytics() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const historySheet = ss.getSheetByName(SHEET_NAMES.CHAT_HISTORY);
        const feedbackSheet = ss.getSheetByName(SHEET_NAMES.CHAT_FEEDBACK);
        
        let totalChats = 0;
        let uniqueSessions = new Set();
        let totalMessages = 0;
        let botMessages = 0;
        let userMessages = 0;
        
        if (historySheet) {
            const rows = historySheet.getDataRange().getValues();
            totalMessages = rows.length - 1;
            
            for (let i = 1; i < rows.length; i++) {
                uniqueSessions.add(rows[i][1]);
                if (rows[i][2] === 'bot') botMessages++;
                if (rows[i][2] === 'user') userMessages++;
            }
            
            totalChats = uniqueSessions.size;
        }
        
        let ratings = {1:0, 2:0, 3:0, 4:0, 5:0};
        let totalRatings = 0;
        let sumRatings = 0;
        
        if (feedbackSheet) {
            const rows = feedbackSheet.getDataRange().getValues();
            
            for (let i = 1; i < rows.length; i++) {
                const rating = rows[i][2];
                if (rating >= 1 && rating <= 5) {
                    ratings[rating]++;
                    totalRatings++;
                    sumRatings += rating;
                }
            }
        }
        
        return {
            success: true,
            analytics: {
                totalChats: totalChats,
                totalMessages: totalMessages,
                botMessages: botMessages,
                userMessages: userMessages,
                averageRating: totalRatings > 0 ? (sumRatings / totalRatings).toFixed(2) : 0,
                ratingDistribution: ratings,
                totalRatings: totalRatings
            }
        };
        
    } catch (error) {
        logToSheet('error', `Get chatbot analytics error: ${error.toString()}`, 'getChatbotAnalytics');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

function logToSheet(level, message, location, user = 'System') {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAMES.LOGS);
        
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAMES.LOGS);
            sheet.getRange('1:1').setValues([[
                'log_id', 'timestamp', 'level', 'message', 'location', 'user'
            ]]);
            sheet.getRange('1:1').setFontWeight('bold');
        }
        
        const timestamp = new Date();
        const logId = `LOG-${timestamp.getTime()}`;
        
        sheet.appendRow([logId, timestamp, level, message, location, user]);
        
        return { success: true };
        
    } catch (error) {
        console.error('Failed to log:', error);
        return { success: false, error: error.toString() };
    }
}

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

function initializeSheets() {
    try {


        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        
        // Create all sheets
        const sheets = [
            { name: SHEET_NAMES.MEMBERS, headers: ['member_id', 'full_name', 'ic_number', 'email', 'phone', 'address', 'city', 'state', 'postcode', 'subjects', 'tuition_type', 'enrollment_date', 'status', 'password_hash', 'parent_name', 'parent_phone', 'parent_email', 'emergency_contact', 'school_name', 'current_level', 'created_at', 'updated_at'] },
            { name: SHEET_NAMES.PAYMENTS, headers: ['payment_id', 'member_id', 'amount', 'payment_date', 'transaction_id', 'payment_method', 'status', 'description', 'package_name', 'subjects', 'receipt_url', 'created_at'] },
            { name: SHEET_NAMES.LOGS, headers: ['log_id', 'timestamp', 'level', 'message', 'location', 'user'] },
            { name: SHEET_NAMES.SUBJECTS, headers: ['subject_id', 'name', 'code', 'level', 'base_price', 'description', 'is_active', 'created_at'] },
            { name: SHEET_NAMES.CALENDAR, headers: ['event_id', 'title', 'subject', 'teacher_id', 'type', 'start_datetime', 'end_datetime', 'location', 'students', 'max_students', 'description', 'materials', 'recurring', 'repeat_until', 'repeat_days', 'status', 'created_by', 'created_at', 'updated_at'] },
            { name: SHEET_NAMES.TEACHERS, headers: ['teacher_id', 'name', 'email', 'phone', 'subjects', 'qualification', 'experience', 'status', 'photo_url'] },
            { name: SHEET_NAMES.STUDENTS, headers: ['student_id', 'name', 'ic_number', 'email', 'phone', 'school', 'level', 'subjects', 'parent_name', 'parent_phone', 'status', 'enrollment_date'] },
            { name: SHEET_NAMES.ENROLLMENTS, headers: ['enrollment_id', 'student_data', 'parent_data', 'academic_data', 'payment_data', 'status', 'submitted_at', 'processed_at', 'notes'] },
            { name: SHEET_NAMES.CHAT_HISTORY, headers: ['timestamp', 'session_id', 'sender', 'message', 'context'] },
            { name: SHEET_NAMES.CHAT_FEEDBACK, headers: ['timestamp', 'session_id', 'rating', 'feedback', 'user_id', 'context'] },
            { name: SHEET_NAMES.PRICING, headers: ['package_id', 'level', 'name', 'subjects_count', 'price', 'features', 'is_popular', 'is_active'] },
            { name: SHEET_NAMES.ATTENDANCE, headers: ['attendance_id', 'event_id', 'student_id', 'status', 'check_in_time', 'check_out_time', 'notes', 'marked_by'] }
        ];

        sheets.forEach(sheetInfo => {
            let sheet = ss.getSheetByName(sheetInfo.name);
            
            if (!sheet) {
                sheet = ss.insertSheet(sheetInfo.name);
                const headerRange = sheet.getRange(1, 1, 1, sheetInfo.headers.length);

                headerRange.setValues([sheetInfo.headers]);
                headerRange.setFontWeight("bold");
                sheet.autoResizeColumns(1, sheetInfo.headers.length);
                sheet.setFrozenRows(1);
            }
        });

        // Logs sheet
        let logsSheet = ss.getSheetByName('Logs');
        if (!logsSheet) {
          logsSheet = ss.insertSheet('Logs');
          logsSheet.getRange('1:1').setValues([[
            'log_id', 'timestamp', 'level', 'message', 'location', 'user'
          ]]);
          logsSheet.getRange('1:1').setFontWeight('bold');
        }
        
        logToSheet('info', 'All sheets initialized successfully', 'initializeSheets');
        
        return { success: true, message: 'All sheets initialized successfully' };
        
    } catch (error) {
        logToSheet('error', `Initialize sheets error: ${error.toString()}`, 'initializeSheets');
        return { success: false, error: error.toString() };
    }
}

// ============================================
// EMAIL FUNCTIONS
// ============================================

function sendEnrollmentEmail(enrollmentId, status) {
    try {
        const enrollment = getEnrollment({ enrollment_id: enrollmentId });
        if (!enrollment.success) return;
        
        const studentEmail = enrollment.enrollment.student.email;
        const studentName = enrollment.enrollment.student.fullName;
        
        let subject, body;
        
        if (status === 'approved') {
            subject = 'Your EduSmart Enrollment has been Approved!';
            body = `
                <h2>Welcome to EduSmart Tuition!</h2>
                <p>Dear ${studentName},</p>
                <p>We are pleased to inform you that your enrollment has been approved!</p>
                <h3>Next Steps:</h3>
                <ol>
                    <li>Log in to your dashboard using the credentials sent in a separate email</li>
                    <li>Complete your payment to confirm your slot</li>
                    <li>Access your class schedule and materials</li>
                    <li>Prepare for your first class!</li>
                </ol>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>EduSmart Team</p>
            `;
        } else {
            subject = 'Update on your EduSmart Enrollment';
            body = `
                <h2>Enrollment Update</h2>
                <p>Dear ${studentName},</p>
                <p>Your enrollment status has been updated to: ${status}</p>
                <p>Please log in to your account or contact us for more information.</p>
                <p>Best regards,<br>EduSmart Team</p>
            `;
        }
        
        MailApp.sendEmail({
            to: studentEmail,
            subject: subject,
            htmlBody: body
        });
        
        logToSheet('info', `Enrollment email sent: ${enrollmentId}`, 'sendEnrollmentEmail');
        
    } catch (error) {
        logToSheet('error', `Send enrollment email error: ${error.toString()}`, 'sendEnrollmentEmail');
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createJsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

