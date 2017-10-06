//fs modules
import * as fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as LoadHelpers from './LoadHelpers';
import * as ManifestHelpers from './manifestHelpers';
import * as usfmHelpers from './usfmHelpers.js';
//static
import books from '../../../tC_resources/resources/books';


/**
 * Retrieves tC manifest and returns it or if not available looks for tS manifest.
 * If neither are available tC has no way to load the project, unless its a usfm project.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export function getProjectManifest(projectPath, projectLink) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;
  if (!manifest || !manifest.tcInitialized) {
    manifest = ManifestHelpers.setUpManifest(projectPath, projectLink, manifest);
  }
  return manifest;
}

/**
 * Gets the base name for the project path directory, this is also the project name.
 * i.e. '~/translationCore/projects/a_project_name' returns 'a_project_name'
 * @param {string} projectPath - Project path directory
 */
export function getProjectName(projectPath) {
  return path.parse(projectPath).base;
}

/**
 * Verifies that a project structure is valid to tC expectations. 
 * tC is strictly for tS / or usfm type of importing projects.
 * Other project formats will break tC. This methods main purpose is for
 * finding projects that are not tC format, it is not ensuring that 
 * the project is in tC format.
 * @param {string} projectPath - Path to the project
 * @returns {boolean | string} - If the project is not in tC format
 * returns the err type of the deteced project. If no errors are found
 * returns false.
 */
export function verifyProjectType(projectPath) {
  let invalidTypeError;
  let projectMetaFile;
  /** For multiple book project type detecting */
  if (fs.existsSync(path.join(projectPath, 'meta.json')))
    projectMetaFile = fs.readJSONSync(path.join(projectPath, 'meta.json'));

  if (testResourceByType(projectPath, 'obs'))
    invalidTypeError = 'translationCore does not support checking for Open Bible Stories. It will not be loaded.';
  else if (testResourceByType(projectPath, 'tn'))
    invalidTypeError = 'translationCore does not support checking for translationNotes. It will not be loaded.';
  else if (testResourceByType(projectPath, 'tq'))
    invalidTypeError = 'translationCore does not support checking for translationQuestions. It will not be loaded.';
  else if (testResourceByType(projectPath, 'ta'))
    invalidTypeError = 'translationCore does not support checking for translationAcademy. It will not be loaded.';
  else if (testResourceByType(projectPath, 'tw'))
    invalidTypeError = 'translationCore does not support checking for translationWords. It will not be loaded.';
  else if (projectMetaFile && projectMetaFile.slug === 'bible') {
    invalidTypeError = 'translationCore does not support checking for multiple books. It will not be loaded.';
  }
  else if (projectHasMultipleBooks(projectPath))
    invalidTypeError = 'translationCore does not support checking for multiple books. It will not be loaded.';

  if (invalidTypeError) fs.removeSync(projectPath);
  return invalidTypeError;
}

/**
 * Determines if a project is a specified type by searching the manifest
 * @param {string} projectPath - Path to the selected project to be tested
 * @param {'obs' | 'ts' | 'ta' | 'tw' | 'tn' } type - The type of project to test for
 */
export function testResourceByType(projectPath, type) {
  if (fs.existsSync(path.join(projectPath, 'manifest.yaml'))) {
    let projectYaml = fs.readFileSync(path.join(projectPath, 'manifest.yaml')).toString();
    if (projectYaml) {
      let regex = new RegExp(`source:[\\s\\S]*?identifier: ('${type}'|${type})`, 'gi');
      return regex.test(projectYaml);
    }
  }

  if (fs.existsSync(path.join(projectPath, 'manifest.json'))) {
    let projectManifest = fs.readJSONSync(path.join(projectPath, 'manifest.json'));
    if (projectManifest) {
      if (projectManifest.project && projectManifest.project.id === `${type}` || projectManifest.type && projectManifest.type.id === `${type}`)
        return true;
    }
  }

  return false;
}

/***
 * Returns an array of unique book ids in the project.
 * If `limit` is specified this method will return prematurely when the book count equals the limit.
 * This is mostly designed for counting books in a project.
 *
 * @param {string}  projectPath - path to the project
 * @param {int} limit - the maximum number of books to retrieve.
 * @param {array<string>} bookIDs - an array of unique book ids
 * @return {array<string>}
 */
export const getUniqueBookIds = (projectPath, limit = -1, bookIDs = []) => {
  let newIDs = [...bookIDs];
  for (let file of fs.readdirSync(projectPath)) {
    if (['.', '..', '.git'].indexOf(file) > -1) continue;
    let filePath = path.join(projectPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      newIDs = getUniqueBookIds(filePath, limit, newIDs);
    } else {
      let usfmPath = usfmHelpers.isUSFMProject(filePath);
      if (usfmPath) {
        let usfmData = usfmHelpers.loadUSFMFile(usfmPath);
        if (!usfmData.includes('\\id') && !usfmData.includes('\\h')) {
          //This is not a usfm file, so we are not adding it to detected usfm files
          break;
        }
        let parsedUSFM = usfmHelpers.getParsedUSFM(usfmData);
        let id = usfmHelpers.getUSFMDetails(parsedUSFM).book.id;
        if (newIDs.indexOf(id) === -1 && books[id]) {
          newIDs.push(id);
        }
      }
    }
    if (newIDs.length >= limit && limit !== -1) break;
  }
  return newIDs;
};

/***
 * Checks if a project contains more than one book.
 * @param {string} projectPath - path to the project
 * @returns {boolean} - true if multiple books were found
 */
export const projectHasMultipleBooks = (projectPath) => {
  return getUniqueBookIds(projectPath, 2).length > 1;
};