/* eslint-disable no-console */
import BooksOfTheBible from '../common/BooksOfTheBible';

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
  if (! developerMode && ((toolName !== 'wordAlignment' && bookId !== 'tit') || ! BooksOfTheBible.newTestament[bookId])) {
    return translate('tools.book_not_supported');
  }
  if (! language) {
    return translate('tools.please_select_gl');
  }
  return null;
}
