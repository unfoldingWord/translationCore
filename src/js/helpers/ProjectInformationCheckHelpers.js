import * as LangHelpers from "./LanguageHelpers";

/**
 * Checks if the project manifest includes required project details.
 * It will return true if any are missing.
 * @param {object} manifest - project manifest file.
 * @return {Boolean} - It will return true if any are missing.
 */
export function checkProjectDetails(manifest) {
  return !(
    manifest.project && manifest.project.id &&
    manifest.project.name && isResourceIdValid(manifest.project.resourceId)
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
 * @param {String} resourceId
 * @return {String|null}
 */
export function getResourceIdWarning(resourceId) {
  if (!resourceId) { // invalid if empty
    return 'project_validation.field_required';
  }

  if ((resourceId.length < 3) || (resourceId.length > 4)) { // invalid if length is not 3 to 4
    return 'project_validation.field_invalid_length';
  }

  const regex = new RegExp('^[A-Za-z]{3,4}$'); // matches 3-4 letters like 'ULT', 'ugnt'
  if (!regex.test(resourceId)) { // invalid if not latin letters
    return 'project_validation.invalid_characters';
  }

  return null;
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
    checkers
  } = state.projectInformationCheckReducer;

  if (bookId && isResourceIdValid(resourceId) && LangHelpers.isLanguageCodeValid(languageId) &&
    languageName && languageDirection && !contributors.includes("") && !checkers.includes("")) {
    return true;
  }

  return false;
}
