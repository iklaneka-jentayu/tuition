// Google Apps Script for ExcelLearn Tuition Center
// Spreadsheet Name: ExcelLearn_Tuition_Center_DB

// Initialize the spreadsheet
function initializeSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get sheets
  const sheets = {
    students: getOrCreateSheet(spreadsheet, 'Students'),
    enrollments: getOrCreateSheet(spreadsheet, 'Enrollments'),
    payments: getOrCreateSheet(spreadsheet, 'Payments'),
    users: getOrCreateSheet(spreadsheet, 'Users'),
    logs: getOrCreateSheet(spreadsheet, 'Logs')
  };
  
  // Set headers for each sheet
  setHeaders(sheets.students, [
    'ID', 'Student Name', 'Parent Name', 'Email', 'Phone', 
    'Grade', 'Subjects', 'Plan', 'Status', 'Notes', 
    'Created At', 'Updated At'
  ]);
  
  setHeaders(sheets.enrollments, [
    'ID', 'Student ID', 'Student Name', 'Parent Name', 'Email',
    'Plan', 'Amount', 'Payment Status', 'Enrollment Status',
    'Learning Mode', 'Subjects', 'Created At', 'Payment Date'
  ]);
  
  setHeaders(sheets.payments, [
    'ID', 'Student ID', 'Student Name', 'Amount', 'Description',
    'Payment Method', 'Status', 'Transaction ID', 'Receipt URL',
    'Created At', 'Updated At'
  ]);
  
  setHeaders(sheets.users, [
    'ID', 'Name', 'Email', 'Phone', 'Role', 
    'Password Hash', 'Created At', 'Last Login'
  ]);
  
  setHeaders(sheets.logs, [
    'Timestamp', 'Action', 'User ID', 'Details', 'IP Address'
  ]);
  
  return {
    success: true,
    message: 'Spreadsheet initialized successfully'
  };
}

// Helper function to get or create sheet
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

// Helper function to set headers
function setHeaders(sheet, headers) {
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a6bff');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  sheet.setFrozenRows(1);
}

// Generate unique ID
function generateId(prefix) {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + timestamp + random;
}

// Find row by ID
function findRowById(sheet, id, idColumn = 1) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn - 1] === id) {
      return i + 1; // Return 1-indexed row number
    }
  }
  return -1;
}

// CREATE operation
function createRecord(sheet, data, headers) {
  const id = generateId(getIdPrefix(sheet.getName()));
  const timestamp = new Date().toISOString();
  
  const rowData = headers.map(header => {
    if (header === 'ID') return id;
    if (header === 'Created At') return timestamp;
    if (header === 'Updated At') return timestamp;
    return data[header] || '';
  });
  
  sheet.appendRow(rowData);
  
  logAction('CREATE', sheet.getName(), { id: id, data: data });
  
  return {
    success: true,
    id: id,
    message: 'Record created successfully'
  };
}

// READ operation
function readRecords(sheet, filters = {}) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  if (data.length <= 1) {
    return { records: [] };
  }
  
  const records = [];
  for (let i = 1; i < data.length; i++) {
    const record = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = data[i][j];
    }
    
    // Apply filters if any
    let match = true;
    Object.keys(filters).forEach(key => {
      if (record[key] !== filters[key]) {
        match = false;
      }
    });
    
    if (match) {
      records.push(record);
    }
  }
  
  return { records: records };
}

// UPDATE operation
function updateRecord(sheet, id, updates, idColumn = 1) {
  const rowNum = findRowById(sheet, id, idColumn);
  
  if (rowNum === -1) {
    return {
      success: false,
      message: 'Record not found'
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const updatedRow = data[rowNum - 1];
  
  // Update fields
  Object.keys(updates).forEach(key => {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      updatedRow[colIndex] = updates[key];
    }
  });
  
  // Update Updated At timestamp
  const updatedAtIndex = headers.indexOf('Updated At');
  if (updatedAtIndex !== -1) {
    updatedRow[updatedAtIndex] = new Date().toISOString();
  }
  
  sheet.getRange(rowNum, 1, 1, updatedRow.length).setValues([updatedRow]);
  
  logAction('UPDATE', sheet.getName(), { id: id, updates: updates });
  
  return {
    success: true,
    message: 'Record updated successfully'
  };
}

// DELETE operation
function deleteRecord(sheet, id, idColumn = 1) {
  const rowNum = findRowById(sheet, id, idColumn);
  
  if (rowNum === -1) {
    return {
      success: false,
      message: 'Record not found'
    };
  }
  
  sheet.deleteRow(rowNum);
  
  logAction('DELETE', sheet.getName(), { id: id });
  
  return {
    success: true,
    message: 'Record deleted successfully'
  };
}

// Helper function to get ID prefix based on sheet name
function getIdPrefix(sheetName) {
  const prefixes = {
    'Students': 'STU',
    'Enrollments': 'ENR',
    'Payments': 'PAY',
    'Users': 'USR'
  };
  return prefixes[sheetName] || 'REC';
}

// Log actions
function logAction(action, entity, details) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const logsSheet = spreadsheet.getSheetByName('Logs');
  
  if (!logsSheet) return;
  
  const timestamp = new Date().toISOString();
  const userEmail = Session.getActiveUser().getEmail();
  
  logsSheet.appendRow([
    timestamp,
    action,
    userEmail,
    JSON.stringify(details),
    'Web' // In production, get actual IP from request
  ]);
}

// Web App endpoints
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const request = e.postData ? JSON.parse(e.postData.contents) : e.parameter;
    const action = request.action;
    const data = request.data || {};
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    switch (action) {
      case 'initialize':
        return ContentService
          .createTextOutput(JSON.stringify(initializeSheet()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'create_enrollment':
        const enrollmentsSheet = spreadsheet.getSheetByName('Enrollments');
        const enrollmentHeaders = enrollmentsSheet.getRange(1, 1, 1, enrollmentsSheet.getLastColumn()).getValues()[0];
        const enrollmentResult = createRecord(enrollmentsSheet, data, enrollmentHeaders);
        
        // Also create student record if needed
        const studentsSheet = spreadsheet.getSheetByName('Students');
        const studentData = {
          'Student Name': data.studentName,
          'Parent Name': data.parentName,
          'Email': data.email,
          'Phone': data.phone,
          'Grade': data.grade,
          'Subjects': data.subjects,
          'Plan': data.plan,
          'Status': data.status || 'pending_payment'
        };
        const studentHeaders = studentsSheet.getRange(1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
        createRecord(studentsSheet, studentData, studentHeaders);
        
        return ContentService
          .createTextOutput(JSON.stringify(enrollmentResult))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'create_user':
        const usersSheet = spreadsheet.getSheetByName('Users');
        const userHeaders = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
        const userResult = createRecord(usersSheet, data, userHeaders);
        return ContentService
          .createTextOutput(JSON.stringify(userResult))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'get_students':
        const studentsSheet = spreadsheet.getSheetByName('Students');
        const filters = {};
        if (data.status) filters['Status'] = data.status;
        const students = readRecords(studentsSheet, filters);
        return ContentService
          .createTextOutput(JSON.stringify(students))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'update_enrollment':
        const enrollSheet = spreadsheet.getSheetByName('Enrollments');
        const updateResult = updateRecord(enrollSheet, data.id, data.updates || {});
        return ContentService
          .createTextOutput(JSON.stringify(updateResult))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'update_student':
        const studentSheet = spreadsheet.getSheetByName('Students');
        const studentUpdateResult = updateRecord(studentSheet, data.id, data);
        return ContentService
          .createTextOutput(JSON.stringify(studentUpdateResult))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'delete_student':
        const delStudentSheet = spreadsheet.getSheetByName('Students');
        const deleteResult = deleteRecord(delStudentSheet, data.id);
        return ContentService
          .createTextOutput(JSON.stringify(deleteResult))
          .setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: 'Invalid action'
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ToyyibPay Integration Helper Functions
function processToyyibPay(paymentData) {
  // ToyyibPay API configuration
  const toyibpayApiKey = 'YOUR_TOYYIBPAY_API_KEY';
  const toyibpayUserSecretKey = 'YOUR_TOYYIBPAY_USER_SECRET';
  
  // Create bill in ToyyibPay
  const billData = {
    userSecretKey: toyibpayUserSecretKey,
    categoryCode: 'YOUR_CATEGORY_CODE',
    billName: `Tuition Fee - ${paymentData.studentName}`,
    billDescription: `ExcelLearn Tuition Center - ${paymentData.plan} Plan`,
    billPriceSetting: 1, // 1 = Fixed Price
    billPayorInfo: 1, // 1 = Collect from payer
    billAmount: paymentData.amount * 100, // Amount in cents
    billReturnUrl: 'https://yourwebsite.com/payment-success',
    billCallbackUrl: 'https://yourwebsite.com/payment-callback',
    billExternalReferenceNo: paymentData.referenceNo,
    billTo: paymentData.studentName,
    billEmail: paymentData.email,
    billPhone: paymentData.phone,
    billSplitPayment: 0,
    billSplitPaymentArgs: '',
    billPaymentChannel: '0', // 0 = All channels
    billContentEmail: 'Thank you for your payment!',
    billChargeToCustomer: 1
  };
  
  // Make API call to ToyyibPay
  const response = UrlFetchApp.fetch('https://toyyibpay.com/index.php/api/createBill', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: billData
  });
  
  const result = JSON.parse(response.getContentText());
  
  if (result[0].BillCode) {
    // Update payment record in spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const paymentsSheet = spreadsheet.getSheetByName('Payments');
    
    const paymentRecord = {
      'Student ID': paymentData.studentId,
      'Student Name': paymentData.studentName,
      'Amount': paymentData.amount,
      'Description': `Tuition Fee - ${paymentData.plan} Plan`,
      'Payment Method': 'ToyyibPay',
      'Status': 'pending',
      'Transaction ID': result[0].BillCode,
      'Receipt URL': `https://toyyibpay.com/${result[0].BillCode}`
    };
    
    const headers = paymentsSheet.getRange(1, 1, 1, paymentsSheet.getLastColumn()).getValues()[0];
    createRecord(paymentsSheet, paymentRecord, headers);
    
    return {
      success: true,
      billCode: result[0].BillCode,
      paymentUrl: `https://toyyibpay.com/${result[0].BillCode}`
    };
  } else {
    return {
      success: false,
      message: 'Failed to create ToyyibPay bill'
    };
  }
}

// ToyyibPay callback handler
function handleToyyibPayCallback(callbackData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const paymentsSheet = spreadsheet.getSheetByName('Payments');
  
  // Find payment by transaction ID
  const data = paymentsSheet.getDataRange().getValues();
  const headers = data[0];
  const transactionIdIndex = headers.indexOf('Transaction ID');
  const statusIndex = headers.indexOf('Status');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][transactionIdIndex] === callbackData.billcode) {
      // Update payment status
      const rowNum = i + 1;
      paymentsSheet.getRange(rowNum, statusIndex + 1).setValue(
        callbackData.status_id === '1' ? 'completed' : 'failed'
      );
      
      // If payment completed, update enrollment status
      if (callbackData.status_id === '1') {
        const enrollmentsSheet = spreadsheet.getSheetByName('Enrollments');
        const enrollmentData = enrollmentsSheet.getDataRange().getValues();
        const enrollmentHeaders = enrollmentData[0];
        
        // Find enrollment by reference (you might need to store reference number in enrollment)
        // This is simplified - you'd need to implement proper reference tracking
        
        // Update enrollment status to active
        // Implementation depends on your data structure
      }
      
      break;
    }
  }
  
  return { success: true };
}

// Install trigger for automatic initialization
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ExcelLearn Admin')
    .addItem('Initialize Sheets', 'initializeSheet')
    .addItem('Generate Report', 'generateMonthlyReport')
    .addSeparator()
    .addItem('Sync Data', 'syncWithExternalSystem')
    .addToUi();
}

// Generate monthly report
function generateMonthlyReport() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const studentsSheet = spreadsheet.getSheetByName('Students');
  const paymentsSheet = spreadsheet.getSheetByName('Payments');
  
  const studentsData = readRecords(studentsSheet);
  const paymentsData = readRecords(paymentsSheet);
  
  // Filter completed payments for current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const monthlyPayments = paymentsData.records.filter(payment => {
    if (payment.Status !== 'completed') return false;
    
    const paymentDate = new Date(payment['Created At']);
    return paymentDate.getMonth() + 1 === currentMonth && 
           paymentDate.getFullYear() === currentYear;
  });
  
  // Calculate totals
  const totalRevenue = monthlyPayments.reduce((sum, payment) => {
    return sum + parseFloat(payment.Amount);
  }, 0);
  
  const activeStudents = studentsData.records.filter(student => 
    student.Status === 'active'
  ).length;
  
  // Create report sheet
  const reportSheet = getOrCreateSheet(spreadsheet, `Report_${currentYear}_${currentMonth}`);
  
  const reportData = [
    ['Monthly Report', `For ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`],
    [''],
    ['Total Active Students', activeStudents],
    ['Total Monthly Revenue', `RM ${totalRevenue.toFixed(2)}`],
    ['Number of Payments', monthlyPayments.length],
    [''],
    ['Payment Breakdown by Plan:']
  ];
  
  // Group payments by plan (you'd need to cross-reference with enrollment data)
  // This is simplified
  
  reportSheet.getRange(1, 1, reportData.length, 2).setValues(reportData);
  
  SpreadsheetApp.getUi().alert('Monthly report generated successfully!');
}