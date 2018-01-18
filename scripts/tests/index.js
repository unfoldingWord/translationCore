const exec = require('child_process').exec;
const branchName = process.argv[2];
if (!branchName) {
  throw Error('No branch name specified');
} else {
  var script = `echo 'Pulling branches'; npm run pull-sub ${branchName}; echo 'Installing npm modules'; npm run install-sub; echo 'Running tests'; npm run jest-all;`;
  exec(script, (err) => {
    if (err) throw Error(err);
    else console.log('All tests finished.')
  });
}
