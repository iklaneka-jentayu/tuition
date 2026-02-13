/**
 * EduSmart Tuition Platform - Google Apps Script Backend
 * CRUD Operations with Google Sheets
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your Google Sheet ID

// Initialize all required sheets
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Members sheet
  let membersSheet = ss.getSheetByName('Members');
  if (!membersSheet) {
    membersSheet = ss.insertSheet('Members');
    membersSheet.getRange('1:1').setValues([[
      'member_id', 'full_name', 'email', 'phone', 'subjects', 
      'tuition_type', 'enrollment_date', 'status', 'password_hash'
    ]]);
    membersSheet.getRange('1:1').setFontWeight('bold');
  }
  
  // Payments sheet
  let paymentsSheet = ss.getSheetByName('Payments');
  if (!paymentsSheet) {
    paymentsSheet = ss.insertSheet('Payments');
    paymentsSheet.getRange('1:1').setValues([[
      'payment_id', 'member_id', 'amount', 'payment_date', 
      'transaction_id', 'payment_method', 'status'
    ]]);
    paymentsSheet.getRange('1:1').setFontWeight('bold');
  }
  
  // Logs sheet
  let logsSheet = ss.getSheetByName('Logs');
  if (!logsSheet) {
    logsSheet = ss.insertSheet('Logs');
    logsSheet.getRange('1:1').setValues([[
      'log_id', 'timestamp', 'level', 'message', 'location', 'user'
    ]]);
    logsSheet.getRange('1:1').setFontWeight('bold');
  }
  
  // Subjects sheet
  let subjectsSheet = ss.getSheetByName('Subjects');
  if (!subjectsSheet) {
    subjectsSheet = ss.insertSheet('Subjects');
    subjectsSheet.getRange('1:1').setValues([[
      'subject_id', 'subject_name', 'subject_code', 'level', 'fee'
    ]]);
    subjectsSheet.getRange('1:1').setFontWeight('bold');
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Sheets initialized' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Log function for CGS
function logToSheet(level, message, location, user = 'System') {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logsSheet = ss.getSheetByName('Logs');
    
    if (!logsSheet) {
      logsSheet = ss.insertSheet('Logs');
      logsSheet.getRange('1:1').setValues([['log_id', 'timestamp', 'level', 'message', 'location', 'user']]);
      logsSheet.getRange('1:1').setFontWeight('bold');
    }
    
    const timestamp = new Date();
    const lastRow = logsSheet.getLastRow();
    const logId = `LOG-${timestamp.getTime()}`;
    
    logsSheet.appendRow([logId, timestamp, level, message, location, user]);
  } catch (error) {
    console.error('Failed to log:', error);
  }
}

// CRUD Operations via doPost
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const data = params.data;
    
    logToSheet('info', `doPost called with action: ${action}`, 'doPost', params.user || 'System');
    
    let result;
    
    switch(action) {
      case 'createMember':
        result = createMember(data);
        break;
      case 'getMember':
        result = getMember(data);
        break;
      case 'updateMember':
        result = updateMember(data);
        break;
      case 'deleteMember':
        result = deleteMember(data);
        break;
      case 'getAllMembers':
        result = getAllMembers();
        break;
      case 'createPayment':
        result = createPayment(data);
        break;
      case 'updatePayment':
        result = updatePayment(data);
        break;
      case 'getMemberPayments':
        result = getMemberPayments(data);
        break;
      case 'verifyLogin':
        result = verifyLogin(data);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
        logToSheet('error', `Invalid action: ${action}`, 'doPost');
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logToSheet('error', `doPost error: ${error.toString()}`, 'doPost');
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// CRUD Operations via doGet
function doGet(e) {
  try {
    const action = e.parameter.action;
    const memberId = e.parameter.member_id;
    const paymentId = e.parameter.payment_id;
    
    logToSheet('info', `doGet called with action: ${action}`, 'doGet');
    
    let result;
    
    switch(action) {
      case 'getMember':
        result = getMember({ member_id: memberId });
        break;
      case 'getAllMembers':
        result = getAllMembers();
        break;
      case 'getMemberPayments':
        result = getMemberPayments({ member_id: memberId });
        break;
      case 'getPayment':
        result = getPayment(paymentId);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logToSheet('error', `doGet error: ${error.toString()}`, 'doGet');
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Member CRUD Functions
function createMember(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Members');
    
    const timestamp = new Date();
    const memberId = `MEM-${timestamp.getTime()}`;
    const passwordHash = Utilities.base64Encode(data.password); // Simple encoding, use proper hashing in production
    
    sheet.appendRow([
      memberId,
      data.full_name,
      data.email,
      data.phone,
      data.subjects,
      data.tuition_type,
      timestamp,
      'active',
      passwordHash
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
    const sheet = ss.getSheetByName('Members');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === data.member_id || data[i][2] === data.email) {
        return {
          success: true,
          member: {
            member_id: data[i][0],
            full_name: data[i][1],
            email: data[i][2],
            phone: data[i][3],
            subjects: data[i][4],
            tuition_type: data[i][5],
            enrollment_date: data[i][6],
            status: data[i][7]
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
    const sheet = ss.getSheetByName('Members');
    const data = sheet.getDataRange().getValues();
    const members = [];
    
    for (let i = 1; i < data.length; i++) {
      members.push({
        member_id: data[i][0],
        full_name: data[i][1],
        email: data[i][2],
        phone: data[i][3],
        subjects: data[i][4],
        tuition_type: data[i][5],
        enrollment_date: data[i][6],
        status: data[i][7]
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
    const sheet = ss.getSheetByName('Members');
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.member_id) {
        const row = i + 1;
        
        if (data.full_name) sheet.getRange(row, 2).setValue(data.full_name);
        if (data.phone) sheet.getRange(row, 4).setValue(data.phone);
        if (data.subjects) sheet.getRange(row, 5).setValue(data.subjects);
        if (data.tuition_type) sheet.getRange(row, 6).setValue(data.tuition_type);
        if (data.status) sheet.getRange(row, 8).setValue(data.status);
        
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
    const sheet = ss.getSheetByName('Members');
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
    const sheet = ss.getSheetByName('Members');
    const rows = sheet.getDataRange().getValues();
    
    const passwordHash = Utilities.base64Encode(data.password);
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === data.email && rows[i][8] === passwordHash) {
        if (data.email === 'admin@edusmart.com') {
          return { success: true, role: 'admin', member_id: rows[i][0] };
        }
        return { success: true, role: 'member', member_id: rows[i][0] };
      }
    }
    
    return { success: false, message: 'Invalid credentials' };
    
  } catch (error) {
    logToSheet('error', `Verify login error: ${error.toString()}`, 'verifyLogin');
    return { success: false, error: error.toString() };
  }
}

// Payment CRUD Functions
function createPayment(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Payments');
    
    const timestamp = new Date();
    const paymentId = `PAY-${timestamp.getTime()}`;
    
    sheet.appendRow([
      paymentId,
      data.member_id,
      data.amount,
      timestamp,
      data.transaction_id,
      'ToyibPay',
      'pending'
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
    const sheet = ss.getSheetByName('Payments');
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.payment_id) {
        const row = i + 1;
        
        if (data.status) sheet.getRange(row, 7).setValue(data.status);
        if (data.transaction_id) sheet.getRange(row, 5).setValue(data.transaction_id);
        
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
    const sheet = ss.getSheetByName('Payments');
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
          status: rows[i][6]
        });
      }
    }
    
    return { success: true, payments: payments };
    
  } catch (error) {
    logToSheet('error', `Get member payments error: ${error.toString()}`, 'getMemberPayments');
    return { success: false, error: error.toString() };
  }
}

function getPayment(paymentId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Payments');
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === paymentId) {
        return {
          success: true,
          payment: {
            payment_id: rows[i][0],
            member_id: rows[i][1],
            amount: rows[i][2],
            payment_date: rows[i][3],
            transaction_id: rows[i][4],
            payment_method: rows[i][5],
            status: rows[i][6]
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

// ToyibPay Integration
function initiateToyibPayment(data) {
  // ToyibPay API integration
  // Note: Replace with actual ToyibPay API endpoints
  const toyibPayEndpoint = 'https://api.toyibpay.com/v1/payment';
  
  const payload = {
    merchant_id: 'YOUR_MERCHANT_ID',
    order_id: `ORDER-${new Date().getTime()}`,
    amount: data.amount,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    description: `Tuition Fee - ${data.member_id}`,
    callback_url: 'https://yourdomain.com/payment-callback',
    redirect_url: 'https://yourdomain.com/payment-success'
  };
  
  // In production, this would be an actual API call
  // For demo, return mock response
  return {
    success: true,
    payment_url: 'https://toyibpay.com/pay/demo123',
    order_id: payload.order_id,
    amount: payload.amount
  };
}

// Add these functions to your Google Apps Script (Code.gs)

// Calendar Event CRUD Operations
function createCalendarEvent(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('CalendarEvents');
    
    if (!sheet) {
      sheet = ss.insertSheet('CalendarEvents');
      sheet.getRange('1:1').setValues([[
        'event_id', 'title', 'subject', 'teacher', 'type', 
        'start_datetime', 'end_datetime', 'location', 'students',
        'max_students', 'description', 'materials', 'recurring',
        'repeat_until', 'repeat_days', 'created_at', 'updated_at'
      ]]);
      sheet.getRange('1:1').setFontWeight('bold');
    }
    
    const timestamp = new Date();
    const eventId = `EVT-${timestamp.getTime()}`;
    
    sheet.appendRow([
      eventId,
      data.title,
      data.subject,
      data.teacher,
      data.type,
      data.start,
      data.end,
      JSON.stringify(data.location),
      JSON.stringify(data.students || []),
      data.max_students || 10,
      data.description || '',
      data.materials || '',
      data.recurring || false,
      data.repeat_until || '',
      JSON.stringify(data.repeat_days || []),
      timestamp,
      timestamp
    ]);
    
    logToSheet('info', `Calendar event created: ${eventId}`, 'createCalendarEvent');
    
    return { success: true, event_id: eventId };
    
  } catch (error) {
    logToSheet('error', `Create calendar event error: ${error.toString()}`, 'createCalendarEvent');
    return { success: false, error: error.toString() };
  }
}

function getCalendarEvents() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('CalendarEvents');
    
    if (!sheet) return { success: true, events: [] };
    
    const data = sheet.getDataRange().getValues();
    const events = [];
    
    for (let i = 1; i < data.length; i++) {
      events.push({
        id: data[i][0],
        title: data[i][1],
        subject: data[i][2],
        teacher: data[i][3],
        type: data[i][4],
        start: data[i][5],
        end: data[i][6],
        location: JSON.parse(data[i][7] || '{}'),
        students: JSON.parse(data[i][8] || '[]'),
        max_students: data[i][9],
        description: data[i][10],
        materials: data[i][11],
        recurring: data[i][12],
        repeat_until: data[i][13],
        repeat_days: JSON.parse(data[i][14] || '[]'),
        created_at: data[i][15],
        updated_at: data[i][16]
      });
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
    const sheet = ss.getSheetByName('CalendarEvents');
    
    if (!sheet) return { success: false, message: 'Sheet not found' };
    
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.event_id) {
        const row = i + 1;
        
        if (data.title) sheet.getRange(row, 2).setValue(data.title);
        if (data.subject) sheet.getRange(row, 3).setValue(data.subject);
        if (data.teacher) sheet.getRange(row, 4).setValue(data.teacher);
        if (data.type) sheet.getRange(row, 5).setValue(data.type);
        if (data.start) sheet.getRange(row, 6).setValue(data.start);
        if (data.end) sheet.getRange(row, 7).setValue(data.end);
        if (data.location) sheet.getRange(row, 8).setValue(JSON.stringify(data.location));
        if (data.students) sheet.getRange(row, 9).setValue(JSON.stringify(data.students));
        if (data.max_students) sheet.getRange(row, 10).setValue(data.max_students);
        if (data.description) sheet.getRange(row, 11).setValue(data.description);
        if (data.materials) sheet.getRange(row, 12).setValue(data.materials);
        
        sheet.getRange(row, 17).setValue(new Date()); // updated_at
        
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
    const sheet = ss.getSheetByName('CalendarEvents');
    
    if (!sheet) return { success: false, message: 'Sheet not found' };
    
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.event_id) {
        sheet.deleteRow(i + 1);
        
        logToSheet('info', `Calendar event deleted: ${data.event_id}`, 'deleteCalendarEvent');
        
        return { success: true, message: 'Event deleted successfully' };
      }
    }
    
    return { success: false, message: 'Event not found' };
    
  } catch (error) {
    logToSheet('error', `Delete calendar event error: ${error.toString()}`, 'deleteCalendarEvent');
    return { success: false, error: error.toString() };
  }
}

// Get events by date range
function getEventsByDateRange(startDate, endDate) {
  try {
    const result = getCalendarEvents();
    
    if (!result.success) return result;
    
    const filtered = result.events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      
      return (eventStart >= rangeStart && eventStart <= rangeEnd) ||
             (eventEnd >= rangeStart && eventEnd <= rangeEnd);
    });
    
    return { success: true, events: filtered };
    
  } catch (error) {
    logToSheet('error', `Get events by date range error: ${error.toString()}`, 'getEventsByDateRange');
    return { success: false, error: error.toString() };
  }
}

// Get events by teacher
function getEventsByTeacher(teacherId) {
  try {
    const result = getCalendarEvents();
    
    if (!result.success) return result;
    
    const filtered = result.events.filter(event => event.teacher === teacherId);
    
    return { success: true, events: filtered };
    
  } catch (error) {
    logToSheet('error', `Get events by teacher error: ${error.toString()}`, 'getEventsByTeacher');
    return { success: false, error: error.toString() };
  }
}

// Get events by student
function getEventsByStudent(studentId) {
  try {
    const result = getCalendarEvents();
    
    if (!result.success) return result;
    
    const filtered = result.events.filter(event => 
      event.students && event.students.includes(studentId)
    );
    
    return { success: true, events: filtered };
    
  } catch (error) {
    logToSheet('error', `Get events by student error: ${error.toString()}`, 'getEventsByStudent');
    return { success: false, error: error.toString() };
  }
}

// Check for scheduling conflicts
function checkScheduleConflicts(data) {
  try {
    const result = getEventsByDateRange(data.start, data.end);
    
    if (!result.success) return result;
    
    const conflicts = result.events.filter(event => {
      if (event.id === data.event_id) return false; // Skip self
      
      // Check for teacher conflict
      if (event.teacher === data.teacher) return true;
      
      // Check for student conflicts (if students are assigned)
      if (data.students && data.students.length > 0) {
        const commonStudents = event.students.filter(s => data.students.includes(s));
        if (commonStudents.length > 0) return true;
      }
      
      return false;
    });
    
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

// Initialize calendar sheet
function initializeCalendarSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    let sheet = ss.getSheetByName('CalendarEvents');
    if (!sheet) {
      sheet = ss.insertSheet('CalendarEvents');
      sheet.getRange('1:1').setValues([[
        'event_id', 'title', 'subject', 'teacher', 'type', 
        'start_datetime', 'end_datetime', 'location', 'students',
        'max_students', 'description', 'materials', 'recurring',
        'repeat_until', 'repeat_days', 'created_at', 'updated_at'
      ]]);
      sheet.getRange('1:1').setFontWeight('bold');
      sheet.setFrozenRows(1);
      
      // Add some sample data for testing
      const sampleData = [
        [
          'EVT-SAMPLE1',
          'Mathematics Form 4',
          'mathematics',
          'teacher1',
          'online',
          new Date(new Date().setHours(14,0,0,0)),
          new Date(new Date().setHours(16,0,0,0)),
          JSON.stringify({link: 'https://zoom.us/j/123456789'}),
          JSON.stringify(['student1', 'student2']),
          10,
          'Chapter 5: Trigonometry',
          'Textbook, Calculator',
          false,
          '',
          '[]',
          new Date(),
          new Date()
        ]
      ];
      
      if (sampleData.length > 0) {
        sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
      }
    }
    
    // Create teachers sheet if not exists
    let teachersSheet = ss.getSheetByName('Teachers');
    if (!teachersSheet) {
      teachersSheet = ss.insertSheet('Teachers');
      teachersSheet.getRange('1:1').setValues([[
        'teacher_id', 'name', 'email', 'phone', 'subjects', 'qualification', 'status'
      ]]);
      teachersSheet.getRange('1:1').setFontWeight('bold');
      
      // Add sample teachers
      const teachers = [
        ['teacher1', 'Dr. Sarah Johnson', 'sarah@edusmart.com', '0123456789', 'Mathematics,Physics', 'PhD Mathematics', 'active'],
        ['teacher2', 'Mr. Ahmad Faiz', 'ahmad@edusmart.com', '0123456790', 'Science,Biology', 'MSc Biology', 'active'],
        ['teacher3', 'Ms. Lim Xiao Mei', 'lim@edusmart.com', '0123456791', 'English,Malay', 'BA English', 'active']
      ];
      teachersSheet.getRange(2, 1, teachers.length, teachers[0].length).setValues(teachers);
    }
    
    logToSheet('info', 'Calendar sheets initialized', 'initializeCalendarSheet');
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Calendar sheets initialized successfully' 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logToSheet('error', `Initialize calendar sheets error: ${error.toString()}`, 'initializeCalendarSheet');
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}