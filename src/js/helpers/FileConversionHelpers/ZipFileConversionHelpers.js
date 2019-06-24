import fs from 'fs-extra';
import path from 'path-extra';
import AdmZip from 'adm-zip';
// contstants
import { IMPORTS_PATH, TEMP_IMPORT_PATH } from '../../common/constants';

/**
 * unzips a `*.tStudio` or a `*.tCore` file to atemporary
 * folder path in tC imports folder and then moves it into tC imports folder.
 * @param sourceProjectPath
 * @param selectedProjectFilename
 */
export const convertToProjectFormat = (sourceProjectPath, selectedProjectFilename) => {
  /** Must unzip before project structure is verified */
  const zip = new AdmZip(sourceProjectPath);
  // extract .tstudio project to temp folder in tC imports folder
  zip.extractAllTo(TEMP_IMPORT_PATH, /*overwrite*/true);
  // the folder name of the project inside the .studio zip file may be different from
  // the actual name of the .studio zip file therefore get actual name from folder
  let currentProjectFilename = fs.readdirSync(TEMP_IMPORT_PATH)
    .filter((element) => element !== 'manifest.json' && element !== '.DS_Store')[0];
  const srcPath = path.join(TEMP_IMPORT_PATH, currentProjectFilename);
  // projectName is the file name of the .studio file which now allows renaming .tstudio projects
  const destinationPath = path.join(IMPORTS_PATH, selectedProjectFilename);
  // copy project from imports folder to projects folder
  fs.copySync(srcPath, destinationPath);
  // remove/delete project folder from temp folder
  fs.removeSync(TEMP_IMPORT_PATH);
};
