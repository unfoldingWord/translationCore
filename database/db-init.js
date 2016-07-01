var db;
var fs = require("fs");
var SQL = require('./js/sql.js');
try {
  var filebuffer = fs.readFileSync('test.sqlite');
  db = new SQL.Database(filebuffer);
}
catch (error) {
  db = new SQL.Database();
  var buffer = new Buffer("");
  fs.writeFileSync("test.sqlite", buffer);
}


db.exec('create table people (name text, shirt Text);');
db.exec('insert into people (name, shirt) VALUES ("Joe", "Green");');

module.exports = db.SQL;
