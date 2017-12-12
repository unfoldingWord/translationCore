/* eslint-disable no-console */

let languages = null; // cache languages

export const getLanguages = () => {
  if (!languages) {
    const langList = require('../../assets/langnames');
    languages = [];
    for (let language of langList) {
      const text = language.ang || language.ln || language.lc;
      if (language.lc) {
        languages.push({code: language.lc, text: text, ltr: language.ld !== 'rtl'});
      }
    }
  }
  return languages;
};
