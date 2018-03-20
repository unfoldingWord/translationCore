/* eslint-disable no-console */

/**
 * Gets the status for the Tool Card launch button. The string returned informs the user why it can't be launched
 * @param {String} toolName
 * @param {String} language
 * @param {String} bookId
 * @param {bool} developerMode
 * @param {Function} translate
 * @return {String} - Reason why it can't be launched
 */
export function getToolCardLaunchStatus(toolName, language, bookId, developerMode, translate) {
  if (! developerMode && toolName !== 'wordAlignment' && bookId !== 'tit') {
    return translate('home.tools.book_not_supported');
  }
  if (! language) {
    return translate('home.tools.gl_select');
  }
  return null;
}
