/* eslint-disable no-console */

let languageCodes = null; // for quick lookup
let languageNames = null; // for quick lookup
let languageNamePrompts = null; // for quick lookup
let languageIdPrompts = null; // for quick lookup
let languages = null; // cache languages for speed up
let languageListByName = null; // list caching for speed up

export const DEFAULT_GATEWAY_LANGUAGE = 'en';
export const gatewayLanguages = [{lc: 'en', name: 'English'}, {lc: 'hi', name: 'Hindi'}];

/**
 * @description - returns a list of language objects from langnames.json sorted by language code.
 * @return {array}
 */
export const getLanguagesSortedByCode = () => {
  if (!languages) {
    languages = [];
    const languageCodes = getLanguageCodes();
    for (let code of Object.keys(languageCodes.local).sort()) {
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
    for (let code of Object.keys(languageCodes.local).sort()) {
      if ( languageCodes.english[code] ) {
        const language = languageCodes.english[code];
        languageNames[language.name] = language;
      }
      const language = languageCodes.local[code];
      languageNames[language.name] = language;
    }

    // create sorted list by name
    languageListByName = [];
    for (let name of Object.keys(languageNames)) {
      languageListByName.push(languageNames[name]);
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
export const getLanguageCodes = ()  =>{
  if (!languageCodes) {
    const langList = require('../../assets/langnames');
    languageNamePrompts = {};
    languageIdPrompts = {};
    const localCodes = {};
    const englishCodes = {};
    languageCodes = { local: localCodes, english: englishCodes};
    for (let language of langList) {
      const code = language.lc;
      const english = language.ang;
      const name = language.ln || english || code;
      if (code) {
        const ltr = language.ld !== 'rtl';
        const entry = { code: code, name: name, ltr: ltr,
          namePrompt: name + ' [' + code + ']', idPrompt: code + ' (' + name + ')'
        };
        localCodes[code] = entry;
        languageNamePrompts[entry.namePrompt] = entry;
        languageIdPrompts[entry.idPrompt] = entry;

        if (english && (english !== name)) {
          // add english entry
          const entry = { code: code, name: english, ltr: ltr,
            namePrompt: english + ' [' +code + ']', idPrompt: code + ' (' + english + ')'
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
 * @description - searches language array to match language code.
 * @param {string} code
 * @return {object} language entry matched or null if no match
 */
export const getLanguageByCode = (code) => {
  if (code) {
    getLanguagesSortedByCode(); // make sure initialized
    return languageCodes.local[code];
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
 * @return {object} found language or null
 */
export const getLanguageByNameSelection = (name) => {
  let language = getLanguageByName(name);
  if (language != null) {
    return language;
  }
  if (name) { // fallback to use prompt
    language = languageNamePrompts[name];
    if (language != null) {
      return language;
    }

    // now try case insensitive search
    const nameLC = name.toLowerCase();
    const languageList = getLanguagesSortedByName();
    for (let language of languageList) {
      if ((language.name.toLowerCase() === nameLC) || (language.namePrompt.toLowerCase() === nameLC)) {
        return language;
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

/**
 * Gets the GL Hint
 * @param {String} language
 * @param {Function} translate
 */
export function getGLHint(language, translate) {
  if(!language) {
    return translate('tools.please_select_gl');
  } else if(language !== DEFAULT_GATEWAY_LANGUAGE) {
    return translate('only_english');
  } else {
    return null;
  }
}

/**
 * Returns an alpahbetical list of Gateway Languages
 */
export function getGatewayLanguageList() {
  return sortByNamesCaseInsensitive(gatewayLanguages);
}
