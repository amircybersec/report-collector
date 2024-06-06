// Define the API token for authentication.
var API_TOKEN = "YOUR_SECRET_API_TOKEN";

/**
 * Recursively flatten a nested JSON object into a flat structure.
 * @param {Object} jsonObj - The JSON object to flatten.
 * @param {string} parentKey - The current parent key in the recursion (used to build the flat key).
 * @param {Object} result - The accumulated result object.
 * @returns {Object} - The flattened JSON object.
 */
function flattenJsonObject(jsonObj, parentKey = '', result = {}) {
  for (let key in jsonObj) {
    // Generate the new key based on current level and parent key.
    let newKey = parentKey ? `${parentKey}.${key}` : key;

    // If the current key's value is an object and not null, recursively flatten further.
    if (typeof jsonObj[key] === 'object' && jsonObj[key] !== null) {
      flattenJsonObject(jsonObj[key], newKey, result);
    } else {
      // If it's a base value, just set it in the result object with the flat key structure.
      result[newKey] = jsonObj[key];
    }
  }
  return result;
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Uncomment if token based authentication is required.
  // Validate the API token provided in the request.
  // if (!e.parameter.apiToken || e.parameter.apiToken !== API_TOKEN) {
  //   return ContentService.createTextOutput(JSON.stringify({
  //     'result': 'error',
  //     'message': 'Invalid API Token'
  //   })).setMimeType(ContentService.MimeType.JSON);
  // }

  try {
    // Parse the POST data.
    var jsonData = JSON.parse(e.postData.contents);

    // Extract the common fields.
    var commonFields = {
      'resolver': jsonData.resolver,
      'proto': jsonData.proto,
      'transport': jsonData.transport,
      'endpoint.host': jsonData.result.endpoint.host,
      'endpoint.port': jsonData.result.endpoint.port,
      'clientIP': jsonData.clientIP,
      'clientASN' : jsonData.clientASN,
      'clientCountry': jsonData.clientCountry,
      'clientAsOrg': jsonData.clientAsOrg
    };

    // Flatten each attempt and add the common fields.
    var flattenedRows = jsonData.result.attempts.map(function (attempt) {
      var flattenedAttempt = flattenJsonObject(attempt);
      return Object.assign({}, commonFields, flattenedAttempt);
    });

    // Fetch the header from the sheet, or set the initial header if the sheet is empty.
    var header = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newColumns = [];

    // Check for new fields and add them to the header and the newColumns list.
    for (var row of flattenedRows) {
      for (var key in row) {
        if (header.indexOf(key) === -1) {
          header.push(key);
          newColumns.push(key);
        }
      }
    }

    // If new fields were found, update the header in the spreadsheet.
    if (newColumns.length > 0) {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(header);
      } else {
        sheet.getRange(1, header.length - newColumns.length + 1, 1, newColumns.length).setValues([newColumns]);
      }
    }

    // Populate the new row data in the order of the header for each attempt.
    var rows = flattenedRows.map(function (row) {
      return header.map(function (key) {
        return row[key] || "";
      });
    });

    // Append the new data rows to the sheet.
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, header.length).setValues(rows);

    // Return a success response.
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // If there's any error in the process, return an error response with the error message.
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
