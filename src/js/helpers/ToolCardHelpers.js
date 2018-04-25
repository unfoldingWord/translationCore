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
  if (!isToolSupported(toolName, bookId, developerMode)) {
    return translate('tools.book_not_supported');
  }
  if (!language) {
    return translate('tools.please_select_gl');
  }
  return null;
}

/**
 * tests if book is a New Testament book
 * @param bookId
 * @return {boolean}
 */
export function isNtBook(bookId) {
  return bookId in BooksOfTheBible.newTestament;
}

/**
 * Checks if a tool is supported.
 * @param {string} toolName
 * @param {string} bookId
 * @param {bool} developerMode
 * @return {boolean}
 */
export function isToolSupported(toolName, bookId, developerMode) {
  const isTitus = bookId === 'tit';
  const isNTAlignment = (toolName === 'wordAlignment') && isNtBook(bookId);
  return developerMode || (isTitus || isNTAlignment);
}
