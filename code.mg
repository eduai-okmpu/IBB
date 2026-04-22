/**
 * PhysicsAccess Auth Backend Script (CORS Optimized)
 * Paste this code into your Google Apps Script editor (script.google.com)
 * 
 * IMPORTANT: You must also update appscript.json (Project Settings > Show "appsscript.json" manifest file)
 * Add these oauthScopes:
 * {
 *   "oauthScopes": [
 *     "https://www.googleapis.com/auth/spreadsheets",
 *     "https://www.googleapis.com/auth/script.external_request"
 *   ]
 * }
 * 
 * After updating the code, re-deploy the Web App:
 * Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone
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
    const params = e.parameter || {};
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
  if (!data) {
    return createResponse({ success: false, message: 'No data received' });
  }
  
  const action = data.action;
  if (action === 'register') {
    return handleRegister(data);
  } else if (action === 'login') {
    return handleLogin(data);
  } else if (action === 'listUsers') {
    return handleListUsers(data);
  } else if (action === 'updateUser') {
    return handleUpdateUser(data);
  } else if (action === 'chat') {
    return handleChat(data);
  } else if (action === 'saveScore') {
    return handleSaveScore(data);
  } else if (action === 'updateProfile') {
    return handleUpdateProfile(data);
  } else {
    return createResponse({ success: false, message: 'Invalid action: ' + action });
  }
}

function handleChat(data) {
  // Safe access — prevent "Cannot read properties of undefined"
  const email = String(data.email || '').trim().toLowerCase();
  const userText = String(data.text || '');

  if (!email || !userText) {
    return createResponse({ success: false, message: 'Email or text is missing.' });
  }
  
  const systemPrompt = "Сен — PhysicsAccess платформасының қазақ тілді AI көмекшісісің. Сенің міндетің — оқушыларға физика пәнін қарапайым, түсінікті және қызықты түрде түсіндіру. Әрқашан қазақ тілінде жауап бер. МАҢЫЗДЫ: Тек соңғы жауабыңды жаз. Ішкі ойлау процесін, нұсқаларды, жоспарларды, Draft деп белгіленген бөліктерді ЖАЗБА. Тікелей, таза жауап бер.";
  
  // No history logic, just the prompt and the current question
  const context = [
    { role: 'user', parts: [{ text: 'Нұсқау: ' + systemPrompt + '\n\nСұрақ: ' + userText }] }
  ];

  // 3. Call Gemma API
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('Gemini_API');
    if (!apiKey) throw new Error('Gemini_API key not found in Script Properties.');

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=' + apiKey;
    
    const payload = {
      contents: context,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseText = response.getContentText();
    const result = JSON.parse(responseText);
    
    if (result.error) throw new Error(result.error.message);
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Empty response.');
    }
    
    // Get text from response, check all parts
    var aiText = '';
    var parts = result.candidates[0].content.parts || [];
    for (var p = 0; p < parts.length; p++) {
      if (parts[p].text) {
        aiText += parts[p].text;
      }
    }
    aiText = aiText.trim();
    
    // Clean Gemma 4 thinking artifacts
    aiText = aiText.replace(/<\|think\|>[\s\S]*?<\|\/think\|>/g, '');
    aiText = aiText.replace(/<\|channel\|>[\s\S]*?<channel\|>/g, '');
    
    var lines = aiText.split('\n');
    var hasReasoning = false;
    for (var r = 0; r < lines.length; r++) {
      var ln = lines[r].trim();
      if (ln.match(/^\* (Identity|Tone|Goal|Constraint|Self-Correction|Option \d|Draft)/i) ||
          ln.match(/^\* \*.*:\*/) ||
          ln.match(/^\*Self-Correction/)) {
        hasReasoning = true;
        break;
      }
    }
    
    if (hasReasoning) {
      var blocks = aiText.split(/\n\n\n|\n\n/);
      var answerBlocks = [];
      var foundAnswer = false;
      
      for (var b = 0; b < blocks.length; b++) {
        var block = blocks[b].trim();
        if (!block) continue;
        
        var isReasoning = false;
        var firstLine = block.split('\n')[0].trim();
        if (firstLine.match(/^\* /)) isReasoning = true;
        if (firstLine.match(/^\*[A-Z]/)) isReasoning = true;
        if (firstLine.match(/^(Identity|Tone|Goal|Constraint|Context|Plan|Thinking)/i)) isReasoning = true;
        
        if (!isReasoning && block.length > 20) {
          if (!foundAnswer) {
            answerBlocks = []; 
            foundAnswer = true;
          }
          answerBlocks.push(block);
        } else if (isReasoning) {
          foundAnswer = false; 
        }
      }
      
      if (answerBlocks.length > 0) {
        aiText = answerBlocks.join('\n\n').trim();
      }
    }
    
    if (aiText.charAt(0) === '"' && aiText.charAt(aiText.length - 1) === '"') {
      aiText = aiText.substring(1, aiText.length - 1).trim();
    }
    
    var halfLen = Math.floor(aiText.length / 2);
    if (aiText.length > 100) {
      var firstHalf = aiText.substring(0, halfLen);
      var checkLen = Math.min(100, firstHalf.length);
      var lastChunk = aiText.substring(aiText.length - checkLen);
      var firstChunk = aiText.substring(0, checkLen);
      if (firstChunk === lastChunk && aiText.length > checkLen * 2) {
        aiText = aiText.substring(0, halfLen).trim();
      }
    }
    
    if (!aiText || aiText.replace(/[-\s\n]/g, '').length === 0) {
      aiText = 'Кешіріңіз, сұрағыңызды түсінбедім. Физикаға қатысты сұрақты нақтырақ қойып көріңіз.';
    }

    return createResponse({ success: true, text: aiText });
  } catch (error) {
    return createResponse({ success: false, message: 'AI Connection Error: ' + error.message });
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
      let key = String(headers[j] || '').toLowerCase().trim();
      // Fallback for unnamed column 14 (LessonProgress)
      if (!key && j === 13) key = 'lessonprogress';
      else if (!key) key = 'column_' + j;
      
      user[key] = row[j];
    }
    users.push(user);
  }
  return createResponse(users);
}

function handleUpdateUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) return createResponse({ success: false, message: 'Sheet not found' });

  const oldEmail = String(data.oldEmail || '').toLowerCase();
  if (!oldEmail) return createResponse({ success: false, message: 'oldEmail is required' });
  
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === oldEmail) {
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
    sheet.appendRow(['Name', 'Email', 'Password', 'Role', 'Created At', 'Score', 'Inventory', 'ActiveFrame', 'ActiveIcon', 'ActiveTitle', 'Achievements', 'SpentPoints', 'AssignmentPoints', 'LessonProgress']);
  }

  const email = String(data.email || '').toLowerCase();
  if (!email) return createResponse({ success: false, message: 'Email is required' });
  
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === email) {
      return createResponse({ success: false, message: 'Бұл email тіркелген' });
    }
  }

  sheet.appendRow([
    data.name || '',
    email,
    data.password || '',
    data.role || 'student',
    new Date(),
    0, // Score
    '[]', // Inventory
    '', // ActiveFrame
    '', // ActiveIcon
    '', // ActiveTitle
    '[]', // Achievements
    0, // SpentPoints
    0, // AssignmentPoints
    '{}' // LessonProgress
  ]);

  return createResponse({ success: true, user: { name: data.name || '', role: data.role || 'student', score: 0 } });
}

function handleLogin(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  if (!sheet) {
    return createResponse({ success: false, message: 'Аккаунт табылмады. Алдымен тіркеліңіз.' });
  }

  const email = String(data.email || '').toLowerCase();
  const password = String(data.password || '');
  
  if (!email || !password) {
    return createResponse({ success: false, message: 'Email and password are required' });
  }
  
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === email && String(rows[i][2]) === password) {
      return createResponse({ 
        success: true, 
        user: { 
          name: rows[i][0], 
          role: rows[i][3],
          score: parseInt(rows[i][5]) || 0,
          inventory: rows[i][6] ? JSON.parse(rows[i][6]) : [],
          activeFrame: rows[i][7] || '',
          activeIcon: rows[i][8] || '',
          activeTitle: rows[i][9] || '',
          achievements: rows[i][10] ? JSON.parse(rows[i][10]) : [],
          spentPoints: parseInt(rows[i][11]) || 0,
          assignmentPoints: parseInt(rows[i][12]) || 0,
          lessonProgress: rows[i][13] ? JSON.parse(rows[i][13]) : {}
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

function handleSaveScore(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) return createResponse({ success: false, message: 'Sheet not found' });

  const email = String(data.email || '').toLowerCase();
  const scoreToAdd = parseInt(data.scoreToAdd) || 0;
  
  if (!email) return createResponse({ success: false, message: 'email is required' });
  
  const dataRange = sheet.getDataRange();
  const rows = dataRange.getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === email) {
      let currentScore = parseInt(rows[i][5]) || 0;
      let newScore = currentScore + scoreToAdd;
      sheet.getRange(i + 1, 6).setValue(newScore);
      return createResponse({ success: true, newScore: newScore });
    }
  }
  
  return createResponse({ success: false, message: 'Пайдаланушы табылмады' });
}

function handleUpdateProfile(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) return createResponse({ success: false, message: 'Sheet not found' });

  const email = String(data.email || '').toLowerCase();
  if (!email) return createResponse({ success: false, message: 'email is required' });
  
  const dataRange = sheet.getDataRange();
  const rows = dataRange.getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === email) {
      if (data.name !== undefined) sheet.getRange(i + 1, 1).setValue(data.name);
      if (data.inventory !== undefined) sheet.getRange(i + 1, 7).setValue(JSON.stringify(data.inventory));
      if (data.activeFrame !== undefined) sheet.getRange(i + 1, 8).setValue(data.activeFrame);
      if (data.activeIcon !== undefined) sheet.getRange(i + 1, 9).setValue(data.activeIcon);
      if (data.activeTitle !== undefined) sheet.getRange(i + 1, 10).setValue(data.activeTitle);
      if (data.achievements !== undefined) sheet.getRange(i + 1, 11).setValue(JSON.stringify(data.achievements));
      if (data.spentPoints !== undefined) sheet.getRange(i + 1, 12).setValue(data.spentPoints);
      if (data.assignmentPoints !== undefined) sheet.getRange(i + 1, 13).setValue(data.assignmentPoints);
      if (data.lessonProgress !== undefined) sheet.getRange(i + 1, 14).setValue(JSON.stringify(data.lessonProgress));
      
      return createResponse({ success: true, message: 'Профиль жаңартылды' });
    }
  }
  
  return createResponse({ success: false, message: 'Пайдаланушы табылмады' });
}
