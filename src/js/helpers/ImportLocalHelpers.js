import fs from 'fs-extra';
import path from 'path-extra';
import AdmZip from 'adm-zip';
// contstants
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');
const TEMP_IMPORT_PATH = path.join(path.homedir(), 'translationCore', 'imports', 'temp');

/**
 * Imports a .tStudio project to a temporary folder path in tC imports folder
 * and then moves it into my projects folder.
 * @param {Object} zip
 * @param {String} fileName
 */
export const importProjectAndMoveToMyProjects = (sourcePath, projectName) => {
  /** Must unzip before project structure is verified */
  const zip = new AdmZip(sourcePath);
  // extract .tstudio project to temp folder in tC imports folder
  zip.extractAllTo(TEMP_IMPORT_PATH, /*overwrite*/true);
  // the folder name of the project inside the .studio zip file may be different from
  // the actual name of the .studio zip file therefore get actual name from folder
  let currentProjectName = fs.readdirSync(TEMP_IMPORT_PATH)
    .filter((element) => element !== 'manifest.json' && element !== '.DS_Store')[0];
  const srcPath = path.join(TEMP_IMPORT_PATH, currentProjectName);
  // projectName is the file name of the .studio file which now allows renaming .tstudio projects
  const destinationPath = path.join(DEFAULT_SAVE, projectName);
  // copy project from imports folder to projects folder
  fs.copySync(srcPath, destinationPath);
  // remove/delete project folder from temp folder
  fs.removeSync(TEMP_IMPORT_PATH);
};
