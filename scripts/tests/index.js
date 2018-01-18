const {execSync} = require('child_process');
const branchName = process.argv[2];
if (!branchName) {
  throw Error('No branch name specified');
} else {
  var script = `echo 'Pulling branches'; npm run pull-sub ${branchName};`;
  execSync(script, {stdio:[0,1,2]});

  script = `echo 'Installing npm modules'; npm run install-sub;`;
  execSync(script, {stdio:[0,1,2]});

  script = `echo 'Running tests'; npm run jest-all;`;
  execSync(script, {stdio:[0,1,2]});
}
