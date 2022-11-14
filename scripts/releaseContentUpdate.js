import fs from 'fs-extra';
import path from 'path';
import ospath from 'ospath';

const scu = require('tc-source-content-updater');

function updateResources() {
  const expectedLanguageCodes = ['en', 'hi', 'gk'];
  const resourcesFolder = path.join(ospath.home(), 'translationCore', 'resources');
  fs.ensureDirSync(resourcesFolder);

  if (fs.emptyDir(resourcesFolder)) {
    // get defaults
    console.log(resourcesFolder);
  }
  const haveLocalResources = scu.getLocalResouces(expectedLanguageCodes);
  const neededResources = scu.getLatestResources(haveLocalResources);
  const filesToConvert = scu.downloadResources(neededResources);
  const convertedFiles = scu.convert(filesToConvert);

  convertedFiles.foreach (function(file) {
    scu.moveResources(file);
  });
}

updateResources();
