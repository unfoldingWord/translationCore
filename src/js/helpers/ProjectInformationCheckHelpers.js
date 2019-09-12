import path from 'path-extra';
// helpers
import { getIsOverwritePermitted } from '../selectors';
import { PROJECTS_PATH } from '../common/constants';
import * as LangHelpers from './LanguageHelpers';
import * as ProjectImportFilesystemHelpers from './Import/ProjectImportFilesystemHelpers';
import * as bibleHelpers from './bibleHelpers';
// constants

/**
 * Checks if the project manifest includes required project details.
 * It will return true if any are missing.
 * @param {object} manifest - project manifest file.
 * @return {Boolean} - It will return true if any are missing.
 */
export function checkProjectDetails(manifest) {
  return !(
    manifest.project && manifest.project.id &&
    manifest.project.name && manifest.resource && isResourceIdValid(manifest.resource.id)
  );
}

/**
 * returns true if resource ID is valid.  Determined to be true if there is no error message
 *  generated for resourceId
 * @param {String} resourceId
 * @return {boolean}
 */
function isResourceIdValid(resourceId) {
  return !getResourceIdWarning(resourceId);
}

/**
 * returns a warning message key if resource id is invalid. Returns null if resource id is valid
 * @param {string} resourceId - Translation identifier e.g. ULT
 * @return {String|null}
 */
export function getResourceIdWarning(resourceId) {
  if (!resourceId) { // invalid if empty
    return 'project_validation.field_required';
  }

  const regex = new RegExp('^[A-Za-z]*$'); // matches Latin letters like 'ULT', 'ugnt'

  if (!regex.test(resourceId)) { // invalid if not latin letters
    return 'project_validation.resource_id.invalid_characters';
  }

  if ((resourceId.length < 3) || (resourceId.length > 4)) { // invalid if length is not 3 to 4
    return 'project_validation.resource_id.field_invalid_length';
  }
  return null;
}

/**
 * returns a warning message key if there is already a project that uses these parameters
 * @param {string} resourceId - Translation identifier e.g. ULT
 * @param {string} langID - Target language id. e.g. hi (optional - if not given then project conflicts not checked)
 * @param {string} bookId - Project book id e.g. tit (optional - if not given then project conflicts not checked)
 * @param {string} projectSaveLocation - save location of current project - we will ignore this in finding conflicts
 * @return {String|null} - string if duplicate warning, else null
 */
export function getDuplicateProjectWarning(resourceId, langID, bookId, projectSaveLocation) {
  let projectsThatMatchImportType = ProjectImportFilesystemHelpers.getProjectsByType(langID, bookId, resourceId,
    projectSaveLocation);

  if (projectsThatMatchImportType && projectsThatMatchImportType.length > 0) {
    const currentProjectName = path.basename(projectSaveLocation);
    const inProjectsFolder = (projectSaveLocation === path.join(PROJECTS_PATH, currentProjectName));

    if (inProjectsFolder) { // if the selected project is in Projects folder, remove it from duplicates list
      // ignore current project
      const otherProjectsThatMatchImportType = projectsThatMatchImportType.filter((projectName) => (currentProjectName !== projectName));
      projectsThatMatchImportType = otherProjectsThatMatchImportType;
    }

    if (projectsThatMatchImportType && projectsThatMatchImportType.length > 0) {
      return 'project_validation.conflicting_project';
    }
  }
  return null;
}

/**
 * see if we should permit project overwrite
 * @param {boolean} localImport - true if doing a local import
 * @param {boolean} usfmProject - true if working with USFM project
 * @return {boolean}
 */
export function isOverwritePermitted(localImport, usfmProject) {
  return !!(localImport && usfmProject); // currently only allowed on local import of USFM project
}

/**
 * Checks if the project manifest includes target_language details. For example,
 * language direction, language id and language name.
 * It will return true if either is missing.
 * @param {object} manifest - project manifest file.
 * @return {Boolean} - It will return true if language details are missing or invalid.
 */
export function checkLanguageDetails(manifest) {
  return (
    !(manifest.target_language &&
      manifest.target_language.direction &&
      manifest.target_language.id &&
      LangHelpers.isLanguageCodeValid(manifest.target_language.id) &&
      manifest.target_language.name)
  );
}

/**
 * Checks if the project manifest includes tranlators details.
 * @param {object} manifest - project manifest file.
 * @return {bool} - It will return true if tranlators names are missing.
 */
export function checkTranslators(manifest) {
  return manifest.translators ? manifest.translators.length === 0 : true;
}

/**
 * Checks if the project manifest includes checkers details.
 * @param {object} manifest - project manifest file.
 * @return {bool} - It will return true if checkers names are missing.
 */
export function checkCheckers(manifest) {
  return manifest.checkers ? manifest.checkers.length === 0 : true;
}

/**
 * make sure book is supported by tool
 * @param {object} state - current app state.
 * @param {string} bookId
 * @return {Boolean}
 */
export function validateBookId(state, bookId) {
  return bibleHelpers.isValidBibleBook(bookId);
}

/**
 * verifies if all required fields in the project information reducer are completed.
 * @param {object} state - current app state.
 */
export function verifyAllRequiredFieldsAreCompleted(state) {
  const {
    bookId,
    resourceId,
    languageId,
    languageName,
    languageDirection,
    contributors,
    checkers,
  } = state.projectInformationCheckReducer;

  let valid = (validateBookId(state, bookId) && isResourceIdValid(resourceId) && LangHelpers.isLanguageCodeValid(languageId) &&
    languageName && languageDirection && !contributors.includes('') && !checkers.includes(''));

  if (valid && !getIsOverwritePermitted(state) ){ // if overwrite is not permitted, make sure there is not a project with conflicting name
    const { projectSaveLocation } = state.projectDetailsReducer;
    const duplicate = getDuplicateProjectWarning(resourceId, languageId, bookId, projectSaveLocation);
    valid = valid && !duplicate;
  }

  return !!valid;
}
