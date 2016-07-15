const FileModule = require('./FileModule');

FileModule.readFile('.config', function(data){
	module.exports = {
		token: data
	}
});
