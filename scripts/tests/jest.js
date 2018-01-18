const { exec, spawn } = require('child_process');
const script = 'bash ./scripts/tC_apps.sh';
exec(script, (err, output) => {
  const dirs = output.toString();
  const dirsArray = dirs.split(' ');
  dirsArray.pop();
  var projectsParam = dirsArray.join(' ');
  const projectsParamArray = projectsParam.split(' ');
  var child = spawn('jest', {
    cwd: '.'
  });
  child.stdout.on('data', function (data) {
    outputDataFromTest(data, 'translationCore');
  });
  child.stderr.on('data', function (data) {
    outputDataFromTest(data, 'translationCore');
  });
  for (var dir of projectsParamArray) {
    var childSpawn = spawn('jest', {
      cwd: dir
    });
    childSpawn.stdout.on('data', function (data) {
      outputDataFromTest(data, dir);
    });
    childSpawn.stderr.on('data', function (data) {
      outputDataFromTest(data, dir);
    });
  }
});

function outputDataFromTest(data, testDir) {
  if (data.includes('FAIL')) {
    console.log(`Failed test from ${testDir}`, data.toString());
  }
  if (data.includes('Test Suites:')) {
    console.log(`Finised from ${testDir}`, data.toString());
  }
}