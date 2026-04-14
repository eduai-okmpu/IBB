/**
 * PhysicsAccess Auth Backend Script (CORS Optimized)
 * Paste this code into your Google Apps Script editor (script.google.com)
 */

const USERS_SHEET_NAME = "Users";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return processAction(data);
  } catch (error) {
    return createResponse({ success: false, message: error.message });
  }
}

function doGet(e) {
  try {
    const params = e.parameter;
    if (params.action) {
      return processAction(params);
    }
    
    // Default doGet for books
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const result = [];
    const headers = data[0]; 
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      result.push(item);
    }
    return createResponse(result);
  } catch (error) {
    return createResponse({ success: false, message: error.message });
  }
}

function processAction(data) {
  const action = data.action;
  if (action === 'register') {
    return handleRegister(data);
  } else if (action === 'login') {
    return handleLogin(data);
  } else if (action === 'listUsers') {
    return handleListUsers(data);
  } else if (action === 'updateUser') {
    return handleUpdateUser(data);
  } else {
    return createResponse({ success: false, message: 'Invalid action' });
  }
}

function handleListUsers(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) return createResponse([]);
  
  const dataRange = sheet.getDataRange().getValues();
  const headers = dataRange[0];
  const users = [];
  
  for (let i = 1; i < dataRange.length; i++) {
    const row = dataRange[i];
    const user = {};
    for (let j = 0; j < headers.length; j++) {
      user[headers[j].toLowerCase()] = row[j];
    }
    // Don't leak passwords in the list if possible, but the teacher needs to see/edit them
    users.push(user);
  }
  return createResponse(users);
}

function handleUpdateUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) return createResponse({ success: false, message: 'Sheet not found' });

  const oldEmail = data.oldEmail.toLowerCase();
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1].toLowerCase() === oldEmail) {
      if (data.newName) sheet.getRange(i + 1, 1).setValue(data.newName);
      if (data.newEmail) sheet.getRange(i + 1, 2).setValue(data.newEmail.toLowerCase());
      if (data.newPassword) sheet.getRange(i + 1, 3).setValue(data.newPassword);
      return createResponse({ success: true, message: 'Мәліметтер жаңартылды' });
    }
  }
  
  return createResponse({ success: false, message: 'Пайдаланушы табылмады' });
}

function handleRegister(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(USERS_SHEET_NAME);
    sheet.appendRow(['Name', 'Email', 'Password', 'Role', 'Created At']);
  }

  const email = data.email.toLowerCase();
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === email) {
      return createResponse({ success: false, message: 'Бұл email тіркелген' });
    }
  }

  sheet.appendRow([
    data.name,
    email,
    data.password,
    data.role,
    new Date()
  ]);

  return createResponse({ success: true, user: { name: data.name, role: data.role } });
}

function handleLogin(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  if (!sheet) {
    return createResponse({ success: false, message: 'Аккаунт табылмады. Алдымен тіркеліңіз.' });
  }

  const email = data.email.toLowerCase();
  const password = data.password;
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1].toString() === email.toString() && rows[i][2].toString() === password.toString()) {
      return createResponse({ 
        success: true, 
        user: { 
          name: rows[i][0], 
          role: rows[i][3] 
        } 
      });
    }
  }

  return createResponse({ success: false, message: 'Қате логин немесе құпия сөз' });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
