/* eslint-disable no-console */

let languageCodes = null; // for quick lookup
let languages = null; // cache languages for speed up
let languageListByName = null; // list caching for speed up

/**
 * @description - returns a list of language objects from langnames.json sorted by language code.
 * @return {array}
 */
export const getLanguages = () => {
  if (!languages || !languageCodes) {
    const langList = require('../../assets/langnames');
    languages = [];
    languageCodes = {};
    for (let language of langList) {
      const name = language.ln || language.ang || language.lc;
      if (language.lc) {
        const entry = {code: language.lc, name: name, english:language.ang, ltr: language.ld !== 'rtl',
          namePrompt: name + ' [' + language.lc + ']'};
        languageCodes[language.lc] = entry;
      }
    }
    for (let code of Object.keys(languageCodes).sort()) {
      languages.push(languageCodes[code]);
    }
  }
  return languages;
};

/**
 * @description - searches language array to match language code.
 * @param {string} code
 * @return {object} language entry matched or null if no match
 */
export const getLanguageByCode = (code) => {
  if (code) {
    getLanguages(); // make sure initialized
    return languageCodes[code];
  }
  return null;
};

/**
 * @description - searches language array to do case insensitive match of language name.
 * @param {string} name
 * @return {array} language entry matched or null if no match
 */
export const getLanguageByName = (name) => {
  if (name) {
    const languageList = getLanguagesSortedByName();
    const nameLC = name.toLowerCase();
    for (let language of languageList) {
      if ((language.name.toLowerCase() === nameLC) || (language.namePrompt.toLowerCase() === nameLC)) {
        return language;
      }
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
 * @description - returns cached list of languages sorted by name.  And if cache is empty,
 *                  it is filled from list of languages and sorts them by language name
 * @return {*}
 */
export const getLanguagesSortedByName = () => {
  if (!languageListByName) {
    const languageNames = {};
    for (let language of getLanguages()) {
      languageNames[language.namePrompt] = language;
    }
    // now add anglicized entries
    for (let language of getLanguages()) {
      if (language.english && (language.english !== language.name)) {
        // add english entry
        const entry = {code: language.code, name: language.english, anglicized:true, ltr: language.ltr,
          namePrompt: language.english + ' [' + language.code + ']'};
        languageNames[entry.namePrompt] = entry;
      }
    }
    languageListByName = []; // clone list
    for (let name of Object.keys(languageNames).sort()) {
      languageListByName.push(languageNames[name]);
    }
  }
  return languageListByName;
};
