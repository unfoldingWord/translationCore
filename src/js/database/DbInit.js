// Create the database
module.exports = function() {
  const fs = require('fs');
  const SQL = require('sql.js');

  var db = "";

  try {
    const filebuffer = fs.readFileSync('userdata.sqlite');
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
