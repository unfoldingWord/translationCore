var exec = require('child_process').exec;
var versionNumber = process.argv[2];
if (!versionNumber) {
  console.log("No version number specified");
  return;
}
var command;
command = 'npm version --git-tag-version=false ' + versionNumber;
console.log('Update version: ', command);
exec(command, (err)=> {
  if (err) {
    console.log(err);
    return;
  }
  command = 'git commit package.json -m "updated version to ' + versionNumber + '"'
  console.log('Git commit: ', command)
  exec(command, (err)=> {
    if (err) {
      console.log(err);
      return;
    }
    command = 'git tag v' + versionNumber;
    console.log('Git tag: ', command);
    exec(command, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      command = 'git push origin v' + versionNumber;
      console.log('Git push: ', command);
      exec(command, (err)=> {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Git tag pushed');
      });
    });
  })
});
