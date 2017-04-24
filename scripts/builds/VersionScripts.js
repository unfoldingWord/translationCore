var exec = require('child_process').exec;
var versionNumber = process.argv[2];
if (!versionNumber) {
  console.log("No version number specified");
  return;
}
var script = "git checkout develop &&  \
  npm version --git-tag-version=false " + versionNumber + '&& \
  git commit package.json -m"Update version to ' + versionNumber + '" && \
  git push && \
  git checkout master && \
  git merge develop && \
  git tag v' + versionNumber + '&& \
  git push origin v' + versionNumber;
  exec(script, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Version updated succesfully to ' + version);
});
