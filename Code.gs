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