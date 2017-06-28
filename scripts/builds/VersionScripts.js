const exec = require('child_process').exec;
const versionNumber = process.argv[2];
if (!versionNumber) {
  console.log("No version number specified");
  return;
}
const commands = [
  'git pull',
  'npm version --git-tag-version=false "' + versionNumber + '"',
  'npm install',
  'git commit package.json package-lock.json -m "Update version to ' + versionNumber + '"',
  'git push',
  'git checkout master',
  'git merge develop --ff',
  'git push',
  'git tag v' + versionNumber,
  'git push origin v' + versionNumber,
  'git checkout develop'
]

const betweenCommand = ' && sleep 1s && '
const script = commands.join(betweenCommand);

  exec(script, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Version updated succesfully to ' + versionNumber);
});
