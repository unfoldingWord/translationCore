const exec = require('child_process').exec;
const branchName = process.argv[2];
if (!branchName) {
  throw Error('No branch name specified');
} else {
  var script = `git checkout ${branchName}; git pull;`;
  script += `git submodule foreach --recursive '(git checkout ${branchName}; git pull;)'`;
  exec(script, (err) => {
    const message = err ? err : 'Pulled all submodule branches ' + branchName;
    console.log(message);
  });
}
