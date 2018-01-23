/**
 * These actions are used for controlling localization within the application.
 * @see js/components/Locale
 */

import fs from 'fs-extra';
import path from 'path';
import {initialize, addTranslationForLanguage, setActiveLanguage} from 'react-localize-redux';
import osLocale from 'os-locale';
import _ from 'lodash';

/**
 * The handler for missing translations.
 * @param key
 * @param languageCode
 */
const onMissingTranslation = (key, languageCode) => {
  console.error(`Missing locale translation key "${key}" for language ${languageCode}`);
};

/**
 * This thunk loads the localization data
 * and initializes the localization library.
 *
 * The default language is english.
 * TODO: for now we are loading all translations up-front. However we could instead load one at a time as needed in `setLanguage` for better performance.
 *
 * @return {function(*)}
 */
export const loadLocalization = () => {
  return (dispatch) => {
    const localeDir = path.join(__dirname, '../../locale');
    return fs.readdir(localeDir).then((items) => {
      // load locale
      let languages = [];
      let translations = {};
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
          let langCode = file.replace(/\.json/, '');
          languages.push(langCode);
          translations[langCode] = translation;
        } catch(e) {
          console.error(`Failed to load localization ${localeFile}`, e);
        }
      }
      return Promise.resolve({languages, translations});
    }).then(({languages, translations}) => {
      // init locale
      dispatch(initialize(languages, {
        defaultLanguage: 'en',
        missingTranslationCallback: onMissingTranslation
      }));
      for(const languageCode in translations) {
        if(translations.hasOwnProperty(languageCode)) {
          dispatch(addTranslationForLanguage(translations[languageCode], languageCode));
        }
      }
      return languages;
    }).then((languages) => {
      // select system language
      return osLocale().then(locale => {
        console.log(`Locale detected: ${locale}`);
        const shortLocale = locale.split('_')[0];
        if(_.indexOf(languages, locale) >= 0) {
          dispatch(setLanguage(locale));
        } else if(_.indexOf(languages, shortLocale) >= 0) {
          console.warn(`Using equivalent locale: ${shortLocale}`);
          dispatch(setActiveLanguage(shortLocale));
        } else {
          console.error(`No translations found for locale: ${locale}`);
        }
      });
    }).catch(err => {
      console.log('Failed to initialize localization', err);
    });
  };
};

/**
 * Sets the language to be used when rendering localization.
 *
 * @param {string} languageCode the language code of the localization to be rendered.
 * @return {function(*)}
 */
export const setLanguage = (languageCode) => {
  return (dispatch) => {
    dispatch(setActiveLanguage(languageCode));
  };
};
