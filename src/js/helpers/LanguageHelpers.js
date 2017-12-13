/* eslint-disable no-console */

let languages = null; // cache languages for speed up
let languageListByName = null; // list caching for speed up

/**
 * @description - returns a list of language objects from langnames.json sorted by language code.
 * @return {array}
 */
export const getLanguages = () => {
  if (!languages) {
    const langList = require('../../assets/langnames');
    languages = [];
    for (let language of langList) {
      const name = language.ln || language.ang || language.lc;
      if (language.lc) {
        languages.push({code: language.lc, name: name, ltr: language.ld !== 'rtl',
          namePrompt: name + ' [' + language.lc + ']'});
      }
    }
    languages.sort(function(a,b) {return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0) } );
  }
  return languages;
};

/**
 * @description - searches language array to match language code.
 * @param {string} code
 * @return {object} language entry matched or null if no match
 */
export const getLanguageByCode = (code) => {
  const languageList = getLanguages();
  for (let language of languageList) {
    if (language.code === code) {
      return language;
    }
  }
  return null;
};

/**
 * @description - searches language array to do case insensitive match of language name.
 * @param {string} name
 * @return {array} language entry matched or null if no match
 */
export const getLanguageByName = (name) => {
  const languageList = getLanguages();
  const nameLC = name.toLowerCase();
  for (let language of languageList) {
    if (language.name.toLowerCase() === nameLC) {
      return language;
    }
  }
  return null;
};

/**
 * @description verify language code
 * @param {string} languageID - language code
 * @return {boolean} true if valid code
 */
export const isLanguageCodeValid = (languageID) => {
  const language = getLanguageByCode(languageID);
  return language != null;
};

/**
 * @description verify language name (case insensitive)
 * @param {string} languageName - language name
 * @return {boolean} true if valid code
 */
export const isLanguageNameValid = (languageName) => {
  const language = getLanguageByName(languageName);
  return language != null;
};


/**
 * @description - returns cached list of languages sorted by name.  And if cache is empty,
 *                  it is filled from list of languages and sorts them by language name
 * @return {*}
 */
export const getLanguagesSortedByName = () => {
  if (!languageListByName) {
    languageListByName = getLanguages().slice(0); // clone list
    languageListByName.sort(function (a, b) { // sort by language name
      return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
    });
  }
  return languageListByName;
};
