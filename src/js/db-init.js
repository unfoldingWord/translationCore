// Create the database
module.exports = function() {
  var db = "";
  var fs = require('fs');
  var SQL = require('sql.js');
  try {
    var filebuffer = fs.readFileSync('userdata.sqlite');
    db = new SQL.Database(filebuffer);
  } catch (error) {
    db = new SQL.Database();
    var buffer = new Buffer('');
    fs.writeFileSync('userdata.sqlite', buffer);
  }
  return {
    database: db
  };
};
