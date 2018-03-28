import * as nonTranslatable from '../../locale/nonTranslatable';
import BooksOfTheBible from "../common/BooksOfTheBible";
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
  if (!translation || (translation.indexOf("Missing translation key") >= 0)) { // if not translated, return original text
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
  const deflt = languageName + " (" + languageCode + ")";
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
  if (!bookCode) { // we need to lookup book code
    for (let key of Object.keys(BooksOfTheBible.newTestament)) {
      if (BooksOfTheBible.newTestament[key].toLowerCase() === bookName.toLowerCase()) {
        bookCode = key;
        break;
      }
    }
  }
  let translation = getTranslation(translate, "book_list.nt." + bookCode, null, {book_id: bookCode});
  if (!translation) {
    translation = bookName + " (" + bookCode + ")";
  }
  return translation;
};
