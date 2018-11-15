/* eslint-disable no-console */
import {isNewTestament, isOldTestament} from "./bibleHelpers";

/**
 * Gets the status for the Tool Card launch button. The string returned informs the user why it can't be launched
 * @param {String} language
 * @param {String} bookId
 * @param {bool} developerMode
 * @param {Function} translate
 * @return {String} - Reason why it can't be launched
 */
export function getToolCardLaunchStatus(language, bookId, developerMode, translate) {
  if (!isToolSupported(bookId, developerMode)) {
    return translate('tools.book_not_supported');
  }
  if (!language) {
    return translate('tools.please_select_gl');
  }
  return null;
}

/**
 * Checks if a tool is supported.
 * @param {string} bookId
 * @param {bool} developerMode
 * @return {boolean}
 */
export function isToolSupported(bookId, developerMode) {
  return developerMode || isNewTestament(bookId) || isOldTestament(bookId);
}
