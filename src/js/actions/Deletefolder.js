//file to delete folders and files that are
//not needed for the user using app

//install given package npm del

// install del-npm before running
var del = require('del');
var path = require('path');
// Can specify which files you want deleted in folder or the whole folder
// format by changing 'Test/*js' to delete all javascript files in folder
//-----------------------------------------------------------------

//statments for deleting files specific formatted files inside a folder if needed
// del(['Test/*', '!Test/unicorn.js']).then(paths => {
// 	console.log('Deleted files and folders:\n', paths.join('\n'));
// });

path = path.join('**');
del.sync([path, '!*.js']);
