/* eslint-disable no-console */
import { isValidBibleBook } from './bibleHelpers';

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
  return developerMode || isValidBibleBook(bookId);
}


/**
 * @Description simplify markdown formatted tA article for uss as an abstract in tN toolcard
 * @param {string} fullText - unparsed text from tA article
 * @return {array} [title, intro] - parses out introductory material
 *
 * tA articles are generally of the form:
 *
 * <title>
 * [<introductory material>]
 * [Description]
 * <descriptive material>
 *
 * where
 *   <variable>
 *   [optional]
 *
 * parser returns introductory material if there is any
 * returns descriptive material if no introductory material
 * removes other markdown notation
 * truncates to MAX_TEXT
 * adds "..." if longer than MAX_TEXT
 */
export function parseArticleAbstract(fullText) {
  const MAX_TEXT = 350;

  // get title from start of text
  const parts = fullText.split('#');
  const title = parts[1].trim();

  // get introduction or description if no introduction
  const bodyParts = parts.slice(2, parts.length);
  const wholeBody = bodyParts.join(' ');
  let description = wholeBody.split('Description');
  let partial = '';

  if (description.length>0) {
    // has description
    if (description[0].length < 10) {
      partial = description[1];
    } else {
      partial = description[0];
    }
  } else {
    partial = description[0];
  }

  // remove markup
  let stripped = partial;
  const replacements = [
    {
      match: /([#*]|<\/?u>|<\/?sup>)/gm,
      replace: '',
    },
    {
      match: /(\n>)|(\n\d.)/gm,
      replace: '\n',
    },
  ];

  for (let i = 0, l= replacements.length; i < l; i++) {
    const r = replacements[i];
    stripped = stripped.replace(r.match, r.replace);
  }

  let intro = stripped.trim();

  // trucate with ellipsis
  if (stripped.length > MAX_TEXT) {
    const truncated = stripped.substr(0, MAX_TEXT);
    const lastSpace = truncated.lastIndexOf(' ');
    intro = truncated.substr(0, MAX_TEXT - (MAX_TEXT - lastSpace)) + '...';
  }

  return { title, intro };
}
