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
  try {
    projectMetaFile = fs.readJSONSync(path.join(projectPath, 'meta.json'));
  } catch (e) { }

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
  else if (generalMultiBookProjectSearch(projectPath) > 1)
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
      if (projectManifest.project && projectManifest.project.id === `${type}` || projectManifest.type.id === `${type}`)
        return true;
    }
  } catch (e) { }
  return false;
}
/**
 * Determines if a project contains multiple books by searching for multiple
 * usfm files from different books
 * Note: will always be less than 2
 * @param {string} projectPath - Path to the project to search
 * @returns {number} - Number of books matched
 */
export function generalMultiBookProjectSearch(projectPath) {
  let bookMatched = 0;
  let previouslyMatchedBook;
  let projectSubFolders = fs.readdirSync(projectPath);
  for (let file of projectSubFolders) {
    let fileName = file.split('.') || [''];
    if (fileName.length < 2 && fs.lstatSync(path.join(projectPath, file)).isDirectory())
      bookMatched += generalMultiBookProjectSearch(path.join(projectPath, file));
    else {
      let usfmFilePath = usfmHelpers.isUSFMProject(path.join(projectPath, file));
      if (usfmFilePath) {
        let usfmData = usfmHelpers.loadUSFMFile(usfmFilePath);
        let parsedUSFM = usfmHelpers.getParsedUSFM(usfmData);
        let bookId = usfmHelpers.getUSFMDetails(parsedUSFM).book.id;
        if (books[bookId] && bookId !== previouslyMatchedBook) bookMatched++;
        previouslyMatchedBook = bookId;
      }
    }
    if (bookMatched > 1) return bookMatched;
  }
  return bookMatched;
}