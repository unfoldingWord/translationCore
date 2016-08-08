const fs = require(window.__base + 'node_modules/fs-extra');

fs.readFile('.config', 'utf8', function(error, data){
    if (!error) {
	   module.exports = {
		  token: data.trim()
	   }
    }
});
