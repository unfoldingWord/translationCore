/**
 * These actions are used for controlling localization within the application.
 */
import fs from 'fs-extra';
import path from 'path';
import {initialize, addTranslation, setActiveLanguage} from 'react-localize-redux';

/**
 * This thunk loads the localization data
 * and initializes the localization library.
 *
 * @return {function(*)}
 */
export const loadLocalization = () => {
  return (dispatch) => {
    const localeDir = path.join(__dirname, '../../locale');
    return fs.readdir(localeDir).then((items) => {
      let languages = [];
      let translations = [];
      if(!items) {
        return Promise.reject(`No localization files found in ${localeDir}`);
      }
      for(let file of items) {
        if(!file.endsWith('.json')) {
          console.warn(`Skipping invalid localization file ${file}`);
          continue;
        }
        const localeFile = path.join(localeDir, file);
        try {
          let translation = JSON.parse(fs.readFileSync(localeFile));
          languages.push(file.replace(/\.json/, ''));
          translations.push(translation);
        } catch(e) {
          console.error(`Failed to load localization ${localeFile}`, e);
        }
      }
      return Promise.resolve({
        languages: [],
        translations: []
      });
    }).then(({languages, translations}) => {
      dispatch(initialize(languages, { defaultLanguage: 'en'}));
      dispatch(addTranslation(translations));
    }).catch(err => {
      console.log('Failed to initialize localization', err);
    });
  };
};

/**
 * Sets the language to be used when rendering localization.
 *
 * @param {string} langCode the language code of the localization to be rendered.
 * @return {function(*)}
 */
export const setLanguage = (langCode) => {
  return (dispatch) => {
    dispatch(setActiveLanguage(langCode));
  };
};
