var exec = require('child_process').exec;
var versionNumber = process.argv[2];
if (!versionNumber) {
  console.log("No version number specified");
  return;
}
var script = "git pull && \
  npm version --git-tag-version=false " + versionNumber + '&& sleep 1s && \
  git commit package.json package-lock.json -m "Update version to ' + versionNumber + '" && sleep 1s && \
  git push && sleep 1s && \
  git checkout master && sleep 1s && \
  git merge develop --ff && sleep 1s && \
  git push && sleep 1s && \
  git tag v' + versionNumber + '&& sleep 1s && \
  git push origin v' + versionNumber;

  exec(script, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Version updated succesfully to ' + versionNumber);
});
