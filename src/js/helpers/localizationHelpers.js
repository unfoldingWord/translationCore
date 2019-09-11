import * as nonTranslatable from '../../locale/nonTranslatable';
import * as BooksOfTheBible from '../common/BooksOfTheBible';
const translatable = require('../../locale/English-en_US.json');

/**
 * lookup translation for text or key.  First looks for a static translation and then tries a dynamic translation
 * @param {Function} translate - translation function
 * @param {String} text - string or key to translate
 * @param {String} deflt - default string to use if no translation is found
 * @param {Object} params - Params to use for printing
 * @return {String} translated text
 */
export const getTranslation = function (translate, text, deflt, params = {}) {
  let key = text.toLowerCase();

  if (key && (key.indexOf(' ') >= 0)) { // replace spaces with _
    key = key.split(' ').join('_');
  }

  let translation = nonTranslatable[key]; // check for static translation

  if (!translation && translate) { // if not found, try translation lookup
    const shouldHaveTranslation = getNestedKey(translatable, key); // if we should have a dynamic translation

    if (shouldHaveTranslation) {
      translation = translate(key, params);
    }
  }

  if (!translation || (translation.indexOf('Missing translation key') >= 0)) { // if not translated, return original text
    translation = deflt;
  }
  return translation;
};

/**
 * drill down to get value in nested objects
 * @param {Object} translatable
 * @param {String} key
 * @return {String}
 */
const getNestedKey = function (translatable, key) {
  let result = translatable;
  const parts = key.split('.');

  for (let part of parts) {
    if (!result) {
      break; // ran off end
    }
    result = result[part];
  }
  return result;
};

/**
 * lookup translation for language.  Appends language code to translation to make it easier to identify
 * @param {Function} translate
 * @param {String} languageName
 * @param {String} languageCode
 * @return {String}
 */
export const getLanguageTranslation = (translate, languageName, languageCode) => {
  const deflt = languageName + ' (' + languageCode + ')';
  let translation = getTranslation(translate, languageName, deflt, {});
  return translation;
};

/**
 * lookup translation for bible book.  Appends language code to translation to make it easier to identify
 * @param {Function} translate
 * @param {String} bookName
 * @param {String} bookCode
 * @return {String}
 */
export const getBookTranslation = (translate, bookName, bookCode) => {
  const allBooks = BooksOfTheBible.getAllBibleBooks();

  if (!bookCode && bookName) { // we need to lookup book code
    for (let key of Object.keys(allBooks)) {
      if (allBooks[key].toLowerCase() === bookName.toLowerCase()) {
        bookCode = key;
        break;
      }
    }
  }

  let translation = null;

  if (bookCode) {
    let keyPrefix = 'book_list.';

    if (BooksOfTheBible.BIBLE_BOOKS.newTestament[bookCode]) {
      keyPrefix += 'nt.';
    } else {
      keyPrefix += 'ot.';
    }
    translation = getTranslation(translate, keyPrefix + bookCode, null, { book_id: bookCode });
  }

  if (!translation) { // if no translation, make default
    if (!bookName && bookCode) { // we need to lookup book name
      bookName = allBooks[bookCode];
    }

    if (bookName) {
      translation = bookName;

      if (bookCode) {
        translation += ' (' + bookCode + ')';
      }
    } else {
      translation = bookCode;
    }
  }
  return translation;
};

/**
 * lookup translation for bible book (without language code).  Appends language code to translation to make it easier to identify
 * @param {Function} translate
 * @param {String} bookName
 * @param {String} bookCode
 * @return {String}
 */
export const getBookTranslationShort = (translate, bookName, bookCode) => {
  let BookNameLocalized = getBookTranslation(translate, bookName, bookCode);

  if (BookNameLocalized) {
    BookNameLocalized = BookNameLocalized.split(' (')[0]; // remove book code
  } else { // if no translation make default
    BookNameLocalized = bookName || bookCode;
  }
  return BookNameLocalized;
};
