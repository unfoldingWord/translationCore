var reportTemplate = (
'<!DOCTYPE html> \
<html> \
  <head> \
    <meta charset="UTF-8"> \
    <title>Check Report</title> \
    <link rel="stylesheet" href="./../../../../../node_modules/bootstrap/dist/css/bootstrap.min.css"> \
    <link rel="stylesheet" href="./../../../../../node_modules/bootstrap/dist/css/bootstrap-theme.min.css"> \
  </head> \
  <body> \
    <button class="btn btn-primary hidden-print" onclick="saveAsPDF()" style="position: fixed;z-index: 100;top: 10px; right: 10px;">Save as PDF</button> \
    <div id="content"></div> \
  </body>\
</html>' );
module.exports = reportTemplate;
