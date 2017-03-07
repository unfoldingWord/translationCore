var exec = require('child_process').exec;
var versionNumber = process.argv[2];
if (!versionNumber) {
  console.log("No version number specified");
  return;
}
var command = 'git tag v' + versionNumber;
console.log(command);
exec(command, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Git commit');
  exec('npm version --git-tag-version=false ' + versionNumber, (err)=> {
    if (err) {
      console.log(err);
      return;
    }
    console.log('NPM version updated');
    exec('git push origin v' + versionNumber, (err)=> {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Git tag pushed');
    });
  });
});
