/**
 * These actions are used for controlling localization within the application.
 * @see js/components/Locale
 */

import fs from 'fs-extra';
import path from 'path';
import {initialize, addTranslationForLanguage, setActiveLanguage} from 'react-localize-redux';
import osLocale from 'os-locale';
import _ from 'lodash';
import appPackage from '../../../package.json';

/**
 * The handler for missing translations.
 * @param key
 * @param languageCode
 */
const onMissingTranslation = (key, languageCode) => {
  console.error(`Missing locale translation key "${key}" for language ${languageCode}`);
};

/**
 * Injects additional information into the translation
 * that should not otherwise be translated. e.g. legal entities
 * @param {object} translation localized strings
 * @param {string} fileName the name of the locale file including the file extension.
 * @return {object} the enhanced translation
 */
const enhanceTranslation = (translation, fileName) => {
  let title = fileName.replace(/\.json/, '');
  let langName = title.split('-')[0];
  let langCode = title.split('-')[1];
  let shortLangCode = langCode.split('_')[0];
  return {
    ...translation,
    '_': {
      'language_name': langName,
      'app_name': appPackage.name,
      'short_locale': shortLangCode,
      'locale': langCode
    }
  };
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
          if(!file.endsWith('.md')) {
            console.warn(`Skipping invalid localization file ${file}`);
          }
          continue;
        }
        const localeFile = path.join(localeDir, file);
        try {
          let translation = JSON.parse(fs.readFileSync(localeFile));
          let title = file.replace(/\.json/, '');
          let langCode = title.split('-')[1];
          let shortLangCode = langCode.split('_')[0];
          translation = enhanceTranslation(translation, file);

          languages.push(langCode);
          translations[langCode] = translation;

          // include short language names for wider locale compatibility
          if(_.indexOf(languages, shortLangCode) === -1) {
            languages.push(shortLangCode);
            translations[shortLangCode] = translation;
          }
        } catch(e) {
          console.error(`Failed to load localization ${localeFile}`, e);
        }
      }
      return Promise.resolve({languages, translations});
    }).then(({languages, translations}) => {
      // init locale
      dispatch(initialize(languages, {
        defaultLanguage: 'en_US',
        missingTranslationCallback: onMissingTranslation
      }));
      for(const languageCode in translations) {
        if(translations.hasOwnProperty(languageCode)) {
          dispatch(addTranslationForLanguage(translations[languageCode], languageCode));
        }
      }
      return {languages, translations};
    }).then(({languages, translations}) => {
      // select system language
      return osLocale().then(locale => {
        console.log(`Locale detected: ${locale}`);
        const shortLocale = locale.split('_')[0];
        if(_.indexOf(languages, locale) >= 0) {
          // matched locale
          dispatch(setLanguage(locale));
        } else if(_.indexOf(languages, shortLocale) >= 0) {
          // equivalent locale
          let equivalentLocale = translations[shortLocale]['_']['locale'];
          console.warn(`Using equivalent locale: ${equivalentLocale}`);
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
