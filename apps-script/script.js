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

  // // Uncomment if token based authentication is required.
  // // Validate the API token provided in the request.
  // if (!e.parameter.apiToken || e.parameter.apiToken !== API_TOKEN) {
  //   return ContentService.createTextOutput(JSON.stringify({
  //     'result': 'error',
  //     'message': 'Invalid API Token'
  //   })).setMimeType(ContentService.MimeType.JSON);
  // }

  try {
    // Parse the POST data and flatten the JSON structure.
    var jsonData = JSON.parse(e.postData.contents);
    var flattenedData = flattenJsonObject(jsonData);
    
    // Fetch the header from the sheet, or set the initial header if the sheet is empty.
    var header = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newColumns = [];

    // Check for new fields and add them to the header and the newColumns list.
    for (var key in flattenedData) {
      if (header.indexOf(key) === -1) {
        header.push(key);
        newColumns.push(key);
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

    // Populate the new row data in the order of the header.
    var row = [];
    for (var i = 0; i < header.length; i++) {
      row.push(flattenedData[header[i]] || "");
    }
    
    // Append the new data row to the sheet.
    sheet.appendRow(row);
    
    // Return a success response.
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // If there's any error in the process, return an error response with the error message.
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
