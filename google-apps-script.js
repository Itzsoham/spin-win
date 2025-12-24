/**
 * Google Apps Script for Discount Spinner
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Click "Deploy"
 * 9. Copy the deployment URL and use it in index.js
 * 
 * Your Google Sheet should have these columns in Row 1:
 * OrderNo | Discount | Date
 */

function doPost(e) {
    try {
        // Get the active spreadsheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Parse the incoming data
        const data = JSON.parse(e.postData.contents);

        // Extract values
        const orderNo = data.orderNo || '';
        const discount = data.discount || '';
        const date = data.date || new Date().toLocaleDateString('en-GB');

        // Append the row to the sheet
        sheet.appendRow([orderNo, discount, date]);

        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({
                'status': 'success',
                'message': 'Data saved successfully',
                'data': {
                    orderNo: orderNo,
                    discount: discount,
                    date: date
                }
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error response
        return ContentService
            .createTextOutput(JSON.stringify({
                'status': 'error',
                'message': error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    // Optional: Handle GET requests to test the script
    return ContentService
        .createTextOutput(JSON.stringify({
            'status': 'success',
            'message': 'Discount Spinner API is running!'
        }))
        .setMimeType(ContentService.MimeType.JSON);
}
