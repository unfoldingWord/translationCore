
/**
 * Checks if the project manifest includes a project id and project name.
 * In other words, a book id and a book name.
 * It will return true if either is missing.
 * @param {object} manifest - project manifest file.
 * @return {bool} - It will return true if either is missing.
 */
export function checkBookReference(manifest) {
  return (
    manifest.project && manifest.project.id && manifest.project.name ? false : true
  );
}

/**
 * Checks if the project manifest includes target_language details. For example,
 * language direction, language id and language name.
 * It will return true if either is missing.
 * @param {object} manifest - project manifest file.
 * @return {bool} - It will return true if either is missing.
 */
export function checkLanguageDetails(manifest) {
  return (
    manifest.target_language &&
    manifest.target_language.direction &&
    manifest.target_language.id &&
    manifest.target_language.name ? false : true
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
    languageId,
    languageName,
    languageDirection,
    contributors,
    checkers
  } = state.projectInformationCheckReducer;

  if (bookId && languageId && languageName && languageDirection && !contributors.includes("") && !checkers.includes("")) {
    return true;
  } else {
    return false;
  }
}