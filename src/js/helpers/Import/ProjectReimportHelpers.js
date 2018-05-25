import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import {getProjectManifest} from '../../selectors';
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * @description Import Helpers for moving the contents of projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * @param {String} projectName
 */
export const preserveExistingProjectChecks = (projectName, translate) => {
  return new Promise((resolve, reject) => {    
    const importPath = path.join(IMPORTS_PATH, projectName);
    const projectPath = path.join(PROJECTS_PATH, projectName);

    // if project dir doesn't exist, it must have been deleted after tC was started. We throw an error and tell them to import the project again
    if (! fs.existsSync(projectPath)) {
      fs.removeSync(importPath);
      // two translatable strings are concatenated for response.
      const compoundMessage = translate('projects.project_does_not_exist', { project_path: projectName }) +
          " " + translate('projects.import_again_as_new_project');
      reject(compoundMessage);
    // if project exists then update import from projects
  } else {
      // copy import contents to project
      if (fs.existsSync(projectPath) && fs.existsSync(importPath)) {
        let projectAppsPath = path.join(projectPath, '.apps');
        let importAppsPath = path.join(importPath, '.apps');
        if (fs.existsSync(projectAppsPath)) {
          if (! fs.existsSync(importAppsPath)) {
            // This wasn't an import of USFM3 so no alignment data exists, can just keep the .apps directory from the project directory
            fs.copySync(path.join(projectPath, '.apps'), path.join(importPath, '.apps'));
          } else {
            // There is some alignment data from the import, as it must have been USFM3, so we preserve it
            // as we copy the rest of the project's .apps data into the import
            let alignmentPath = path.join(importAppsPath, 'translationCore', 'alignmentData');
            if (fs.existsSync(alignmentPath)) {
              let tempAlignmentPath = path.join(importPath, '.temp_alignmentData'); 
              fs.moveSync(alignmentPath, tempAlignmentPath); // moving new alignment data to a temp dir
              fs.removeSync(importAppsPath); // .apps dir can be removed since we only need alignment data
              fs.copySync(projectAppsPath, importAppsPath); // copying the existing project's .apps dir to preserve it
              const manifest = fs.readJsonSync(path.join(projectPath, 'manifest.json'));
              copyAlignmentData(path.join(tempAlignmentPath, manifest.project.id), path.join(alignmentPath, manifest.project.id)); // Now we overwrite any alignment data of the project from the import
              fs.removeSync(tempAlignmentPath); // Done with the temp alignment dir
            }
          }
        }
        if (fs.existsSync(path.join(projectPath, '.git')))
          fs.copySync(path.join(projectPath, '.git'), path.join(importPath, '.git'));
        if (fs.existsSync(path.join(projectPath, 'LICENSE.md')))
          fs.copySync(path.join(projectPath, 'LICENSE.md'), path.join(importPath, 'LICENSE.md'));
        if (fs.existsSync(path.join(projectPath, 'manifest.json')))
          fs.copySync(path.join(projectPath, 'manifest.json'), path.join(importPath, 'manifest.json'));
        resolve(importPath);
      } else {
        reject({ message: 'projects.not_found', data: { projectName, projectPath } });
      }
    }
  });
};

export const copyAlignmentData = (fromDir, toDir) => {
  debugger;
  let fromFiles = fs.readdirSync(fromDir).filter(file => path.extname(file) === '.json');
  let toFiles = fs.readdirSync(toDir).filter(file => path.extname(file) === '.json');
  fromFiles.forEach((file) => {
    let fromFileJson = fs.readJsonSync(path.join(fromDir, file));
    let index = toFiles.indexOf(file);
    let toFileJson = {};
    if(index >= 0){
      toFileJson = fs.readJsonSync(path.join(toDir, toFiles[index]));
    }
    Object.keys(fromFileJson).forEach(function(verseNum) {
      if(! toFileJson[verseNum] || (fromFileJson[verseNum].bottomWords && fromFileJson[verseNum].bottomWords.length > 0))
        toFileJson[verseNum] = fromFileJson[verseNum];
    });
    fs.writeJsonSync(toFileJson, path.join(toDir, file));
  });
};
