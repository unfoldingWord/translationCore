//Create the database
try {
  var fs = require("fs");
  var filebuffer = fs.readFileSync('userdata.sqlite');
  var db = new SQL.Database(filebuffer);
} catch(error){
  var db = new SQL.Database();
  var buffer = new Buffer("");
  fs.writeFileSync("userdata.sqlite", buffer);
}
