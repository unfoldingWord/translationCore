/* eslint-disable no-console */

let languages = null; // cache languages

export const getLanguages = () => {
  if (!languages) {
    const langList = require('../../assets/langnames');
    languages = [];
    for (let language of langList) {
      const text = language.ang || language.ln || language.lc;
      if (language.lc) {
        languages.push({code: language.lc, name: text, ltr: language.ld !== 'rtl'});
      }
    }
    languages.sort(function(a,b) {return (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0) } );
  }
  return languages;
};

export const getLanguageByCode = (code) => {
  const languageList = getLanguages();
  for (let language of languageList) {
    if (language.code === code) {
      return language;
    }
  }
  return null;
};

export const getLanguageByName = (name) => {
  const languageList = getLanguages();
  for (let language of languageList) {
    if (language.name === name) {
      return language;
    }
  }
  return null;
};
