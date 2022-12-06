/* eslint-disable no-console */

let languageCodes = null; // object for quick lookup
let languageNames = null; // object for quick lookup
let languageNamePrompts = null; // object for quick lookup
let languageIdPrompts = null; // object for quick lookup
let languages = null; // list of languages sorted by code for drop down lists
let languageListByName = null; // list of languages sorted by names for for drop down lists
let languageCodeList = null; // sorted list of language codes for quick lookup

/**
 * @description - returns a list of language objects from langnames.json sorted by language code.
 * @return {array}
 */
export const getLanguagesSortedByCode = () => {
  if (!languages) {
    languages = [];
    const languageCodes = getLanguageCodes();
    languageCodeList = Object.keys(languageCodes.local).sort();

    for (let i = 0, l = languageCodeList.length; i < l; i++) {
      const code = languageCodeList[i];

      if ( languageCodes.english[code] ) {
        languages.push(languageCodes.english[code]);
      }
      languages.push(languageCodes.local[code]);
    }
  }
  return languages;
};

/**
 * @description - returns cached list of languages sorted by name.  And if cache is empty,
 *                  it is filled from list of languages and sorts them by language name
 * @return {*}
 */
export const getLanguagesSortedByName = () => {
  if (!languageListByName) {
    const languageCodes = getLanguageCodes();
    languageNames = {};
    languageListByName = [];
    const codes = Object.keys(languageCodes.local).sort();

    for (let i = 0, l = codes.length; i < l; i++) {
      const code = codes[i];

      if ( languageCodes.english[code] ) {
        const language = languageCodes.english[code];
        languageNames[language.name] = language;
        languageListByName.push(language);
      }

      if ( languageCodes.local[code] ) {
        const language = languageCodes.local[code];
        languageNames[language.name] = language;
        languageListByName.push(language);
      }
    }
  }
  languageListByName = sortByNamesCaseInsensitive(languageListByName);
  return languageListByName;
};

/**
 * get keys of dictionary sorted with case insensitive sore
 * @param {dictionary} languageNames
 * @return {string[]}
 */
export const sortByNamesCaseInsensitive = (languageListByName=> {
  const sorted = languageListByName.sort((a, b) => {
    const aLC = a.name.toLowerCase();
    const bLC = b.name.toLowerCase();
    const retValue = aLC < bLC ? -1 : 1;
    return retValue;
  });
  return sorted;
});

/**
 * load dictionary with language codes both by localized and english
 * @return {dictionary}
 */
export const getLanguageCodes = () => {
  if (!languageCodes) {
    const langList = require('../../assets/langnames');
    languageNamePrompts = {};
    languageIdPrompts = {};
    const localCodes = {};
    const englishCodes = {};
    languageCodes = { local: localCodes, english: englishCodes };

    for (let i = 0, l = langList.length; i < l; i++) {
      const language = langList[i];
      const code = language.lc;
      const english = language.ang;
      const name = language.ln || english || code;

      if (code) {
        const ltr = language.ld !== 'rtl';
        const entry = {
          code: code, name: name, ltr: ltr,
          namePrompt: name + ' [' + code + ']', idPrompt: code + ' (' + name + ')',
          data: language,
        };
        localCodes[code] = entry;
        languageNamePrompts[entry.namePrompt] = entry;
        languageIdPrompts[entry.idPrompt] = entry;

        if (english && (english !== name)) {
          // add english entry
          const entry = {
            code: code, name: english, ltr: ltr,
            namePrompt: english + ' [' +code + ']', idPrompt: code + ' (' + english + ')',
          };
          englishCodes[code] = entry;
          languageNamePrompts[entry.namePrompt] = entry;
          languageIdPrompts[entry.idPrompt] = entry;
        }
      }
    }
  }

  return languageCodes;
};

/**
 * @description - searches language array to match language code.  Case insensitive.
 * @param {string} code
 * @return {object} language entry matched or null if no match
 */
export const getLanguageByCode = (code) => {
  if (code) {
    getLanguagesSortedByCode(); // make sure initialized
    let langData = languageCodes.local[code];

    if (!langData) {
      // do case insensitive fast search (since there are over 10,000 codes)
      const codeLc = code.toLowerCase();

      for (let i = 0, len = languageCodeList.length; i < len; i++) {
        const codeToMatch = languageCodeList[i].toLowerCase();

        if (codeToMatch === codeLc) {
          langData = languageCodes.local[languageCodeList[i]];
          break;
        }
      }
    }
    return langData;
  }
  return null;
};

/**
 * @description - searches language array for exact match.
 * @param {string} name
 * @return {array} language entry matched or null if no match
 */
export const getLanguageByName = (name) => {
  if (name) {
    getLanguagesSortedByName(); // make sure initialized
    return languageNames[name];
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
 * @description get language by name or prompt
 * @param {string} name - language name
 * @param {string} code - optional language ID to also match in case of duplicates anglicized names
 * @return {object} found language or null
 */
export const getLanguageByNameSelection = (name, code = '') => {
  let language = getLanguageByName(name);

  if (language != null) {
    if (!code || (code === language.code)) {
      return language;
    }
  }

  if (name) { // fallback to use prompt
    language = languageNamePrompts[name];

    if (language != null) {
      if (!code || (code === language.code)) {
        return language;
      }
    }

    // now try case insensitive search
    const nameLC = name.toLowerCase();
    const languageList = getLanguagesSortedByName();

    for (let i = 0, l = languageList.length; i < l; i++) {
      const language = languageList[i];

      if ((language.name.toLowerCase() === nameLC) || (language.namePrompt.toLowerCase() === nameLC)) {
        if (!code || (code === language.code)) {
          return language;
        }
      }
    }
  }
  return null;
};

/**
 * @description get language by ID or prompt
 * @param {string} languageID - language code
 * @return {object} found language or null
 */
export const getLanguageByCodeSelection = (languageID) => {
  let language = getLanguageByCode(languageID);

  if (language != null) {
    return language;
  }

  if (languageID) { // fallback to use prompt
    language = languageIdPrompts[languageID];

    if (language != null) {
      return language;
    }
  }
  return null;
};

