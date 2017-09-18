//fs modules
import * as fs from 'fs-extra';
import path from 'path-extra';
//constants
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');
//helpers
import * as LoadHelpers from './LoadHelpers';
import * as ManifestHelpers from './manifestHelpers';
import * as usfmHelpers from './usfmHelpers.js';
import * as MergeConflictHelpers from './MergeConflictHelpers';
//static
import books from '../../../tC_resources/resources/books';

/**
 * Retrieves tC manifest and returns it or if not available looks for tS manifest.
 * If neither are available tC has no way to load the project, unless its a usfm project.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 * @param {string} username - Current username of user logged in.
 */
export function getProjectManifest(projectPath, projectLink, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;
  if (!manifest || !manifest.tcInitialized) {
    manifest = ManifestHelpers.setUpManifest(projectPath, projectLink, manifest, username);
  }
  return manifest;
}

/**
 * Gets the base name for the project path directory, this is also the project name.
 * i.e. '~/translationCore/projects/a_project_name' returns 'a_project_name'
 * @param {string} projectPath - Project path directory
 */
export function getProjectName(projectPath) {
  return path.parse(projectPath).base
}

export function verifyProjectType(projectPath, projectType) {
  let invalidTypeError;
  let projectMetaFile;
  try {
    projectMetaFile = fs.readJSONSync(path.join(projectPath, 'meta.json'));
  } catch (e) { }

  if (testResourceByType(projectPath, 'obs'))
    invalidTypeError = 'You cannot load Open Bible Scriptures into tC';
  else if (testResourceByType(projectPath, 'tn'))
    invalidTypeError = 'You cannot load translationNotes resource content into tC';
  else if (testResourceByType(projectPath, 'tq'))
    invalidTypeError = 'You cannot load translationQuestions resource content into tC';
  else if (testResourceByType(projectPath, 'ta'))
    invalidTypeError = 'You cannot load translationAcademy resource content into tC';
  else if (testResourceByType(projectPath, 'tw'))
    invalidTypeError = 'You cannot load translationWords resource content into tC';
  else if (projectMetaFile && projectMetaFile.slug === 'bible') {
    invalidTypeError = 'You cannot load multiple books into tC';
  }
  else if (generalMultiBookProjectSearch(projectPath) > 1)
    invalidTypeError = 'You cannot load multiple books into tC';

  if (invalidTypeError) fs.removeSync(projectPath);
  return invalidTypeError;
}

function testResourceByType(projectPath, type) {
  try {
    let projectYaml = fs.readFileSync(path.join(projectPath, 'manifest.yaml')).toString();
    if (projectYaml) {
      let regex = new RegExp(`source:[\\s\\S]*?identifier: ('${type}'|${type})`, 'gi');
      return regex.test(projectYaml);
    }
  } catch (e) { }
  try {
    let projectManifest = fs.readJSONSync(path.join(projectPath, 'manifest.json'));
    if (projectManifest) {
      if (projectManifest.project && projectManifest.project.id === `${type}`)
        return true;
    }
  } catch (e) { }
  return false;
}

function generalMultiBookProjectSearch(projectPath) {
  let bookMatched = 0;
  let booksString = JSON.stringify(books);
  let projectSubFolders = fs.readdirSync(projectPath);
  for (let file of projectSubFolders) {
    let fileName = file.split('.') || [''];
    if (fileName.length < 2 && fs.lstatSync(path.join(projectPath, file)).isDirectory())
      bookMatched += generalMultiBookProjectSearch(path.join(projectPath, file));
    else {
      if (fileName[0] && booksString.includes(fileName[0])) bookMatched++;
    }
    if (bookMatched > 1) return bookMatched;
  }
  return bookMatched;
}