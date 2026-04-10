/*
Google Apps Script feed publisher for Kasireddi Deals live sync.
Steps:
1) Create Google Sheet with tab name: Products
2) Add headers in row 1:
   Product Name | Brand | Category | Deal Price | List Price | URL | Image URL | Description | Coupon | Badge | Featured | Product ID
3) Fill rows with real offers
4) Go to Extensions -> Apps Script, paste this file
5) Deploy -> New deployment -> Web app
   Execute as: Me
   Access: Anyone
6) Copy the web app URL and use it in Admin -> Live Data -> Feed URL
*/

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Products');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ items: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ items: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headers = values[0];
  var rows = values.slice(1);

  var items = rows
    .filter(function (row) {
      return row.some(function (cell) { return String(cell).trim() !== ''; });
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[String(header).trim()] = row[index];
      });
      return obj;
    });

  return ContentService.createTextOutput(JSON.stringify({ items: items }))
    .setMimeType(ContentService.MimeType.JSON);
}
