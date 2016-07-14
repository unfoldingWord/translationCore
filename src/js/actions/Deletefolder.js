/** *
@description: File to delete current and other folders except js files
 @param
 @return 
  **/

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

var newpath = path.join('**');
del.sync([newpath, '!*.js']);
