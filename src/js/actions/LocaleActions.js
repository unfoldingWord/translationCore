/**
 * These actions are used for controlling localization within the application.
 * @see js/components/Locale
 */

import fs from 'fs-extra';
import path from 'path';
import {initialize, addTranslationForLanguage, setActiveLanguage} from 'react-localize-redux';
import osLocale from 'os-locale';
import _ from 'lodash';
import types from './ActionTypes';
import {setSetting} from './SettingsActions';
import * as nonTranslatable from '../../locale/nonTranslatable';
export const APP_LOCALE_SETTING = 'appLocale';

const DEFAULT_LOCALE = 'en_US';

/**
 * The handler for missing translations.
 * @param key
 * @param languageCode
 */
const onMissingTranslation = (key, languageCode) => {
  console.error(`Missing locale translation key "${key}" for language ${languageCode}`, new Error().stack);
};

/**
 * Splits a locale filename into it's identifiable pieces
 * @param {string} fileName the locale file name (basename)
 * @return {{langName, langCode, shortLangCode}}
 */
const explodeLocaleName = (fileName) => {
  let title = fileName.replace(/\.json/, '');
  let langName = title.split('-')[0];
  let langCode = title.split('-')[1];
  let shortLangCode = langCode.split('_')[0];
  return {langName, langCode, shortLangCode};
};

/**
 * Injects additional information into the translation
 * that should not otherwise be translated. e.g. legal entities
 * @param {object} translation localized strings
 * @param {string} fileName the name of the locale file including the file extension.
 * @param {list} nonTranslatableStrings a list of non-translatable strings to inject
 * @return {object} the enhanced translation
 */
const enhanceTranslation = (translation, fileName, nonTranslatableStrings=[]) => {
  const {langName, langCode, shortLangCode} = explodeLocaleName(fileName);
  return {
    ...translation,
    '_': {
      'language_name': langName,
      'short_locale': shortLangCode,
      'locale': langCode,
      ...nonTranslatableStrings
    }
  };
};

/**
 * Opens the locale selection screen
 * @return {{type: string}}
 */
export const openLocaleScreen = () => ({
  type: types.SHOW_LOCALE_SCREEN
});

/**
 * Closes the locale selection screen
 * @return {{type: *}}
 */
export const closeLocaleScreen = () => ({
  type: types.CLOSE_LOCALE_SCREEN
});

/**
 * Sets the currently active language
 * @param languageCode
 * @return {function(*)}
 */
export const setLanguage = (languageCode) => {
  return (dispatch) => {
    // save user setting
    dispatch(setSetting(APP_LOCALE_SETTING, languageCode));
    // enable the locale
    dispatch(setActiveLanguage(languageCode));
  };
};

/**
 * Indicates the locale has been completely loaded
 * @return {{type: string}}
 */
export const setLocaleLoaded = () => ({
  type: types.LOCALE_LOADED
});

/**
 * This thunk loads the localization data
 * and initializes the localization library.
 *
 * The default language is english.
 * TODO: for now we are loading all translations up-front. However we could instead load one at a time as needed in `setLanguage` for better performance.
 *
 * @param {string} localeDir directory containing locale files
 * @param {string} appLanguage the language code that will be enabled by default
 * @return {function(*)}
 */
export const loadLocalization = (localeDir, appLanguage=null) => {
  return (dispatch) => {
    if(!fs.existsSync(localeDir)) {
      return Promise.reject(`Missing locale dir at ${localeDir}`);
    }
    return fs.readdir(localeDir).then((items) => {
      // load locale
      let languages = [];
      let translations = {};
      if(!items) {
        return Promise.reject(`No localization files found in ${localeDir}`);
      }
      for(let file of items) {
        if(!file.endsWith('.json')) {
          // don't warn if readme or NonTranslatable.js
          if(!file.endsWith('.md') && !file.endsWith('.js')) {
            console.warn(`Skipping invalid localization file ${file}`);
          }
          continue;
        }
        const localeFile = path.join(localeDir, file);
        try {
          let translation = JSON.parse(fs.readFileSync(localeFile));
          translation = enhanceTranslation(translation, file, nonTranslatable);

          const {langCode, shortLangCode} = explodeLocaleName(file);
          languages.push(langCode);
          translations[langCode] = translation;

          // include short language names for wider locale compatibility
          if(_.indexOf(languages, shortLangCode) === -1) {
            languages.push(shortLangCode);
            translations[shortLangCode] = translation;
          }
        } catch(e) {
          console.error(`Failed to load localization ${localeFile}: ${e}`);
        }
      }
      return Promise.resolve({languages, translations});
    }).then(({languages, translations}) => {
      // init locale
      const namedLanguages = languages.map((code) => {
        return {
          code,
          name: translations[code]['_']['language_name']
        };
      });
      dispatch(initialize(namedLanguages, {
        defaultLanguage: DEFAULT_LOCALE,
        missingTranslationCallback: onMissingTranslation
      }));
      for(const languageCode in translations) {
        if(translations.hasOwnProperty(languageCode)) {
          dispatch(addTranslationForLanguage(translations[languageCode], languageCode));
        }
      }
      return {languages, translations};
    }).then(({languages, translations}) => {
      if(appLanguage === DEFAULT_LOCALE) return;

      if(appLanguage) {
        // set selected locale
        console.log(`Saved locale: ${appLanguage}`);
        if(!setActiveLanguageSafely(dispatch, appLanguage, languages, translations)) {
          // fall back to system locale
          return setSystemLocale(dispatch, languages, translations);
        }
      } else {
        // select system language
        return setSystemLocale(dispatch, languages, translations);
      }
    }).then(() => {
      dispatch(setLocaleLoaded());
    }).catch(err => {
      console.log('Failed to initialize localization', err);
    });
  };
};

/**
 * Sets the active locale from the system locale
 * @param dispatch
 * @param languages
 * @param translations
 * @return {Promise}
 */
const setSystemLocale = (dispatch, languages, translations) => {
  return osLocale().then(locale => {
    console.log(`System Locale: ${locale}`);
    setActiveLanguageSafely(dispatch, locale, languages, translations);
  });
};

/**
 * Safely sets the active language by falling back to an equivalent locale if
 * needed.
 *
 * @param dispatch
 * @param {string} locale the locale to set
 * @param {list} languages a list of loaded languages
 * @param {object} translations a dictionary of loaded translations
 * @return {bool} returns true of the language was successfully set.
 */
const setActiveLanguageSafely = (dispatch, locale, languages, translations) => {
  const shortLocale = locale.split('_')[0];
  if (_.indexOf(languages, locale) >= 0) {
    // matched locale
    dispatch(setActiveLanguage(locale));
  } else if (_.indexOf(languages, shortLocale) >= 0) {
    // equivalent locale
    let equivalentLocale = translations[shortLocale]['_']['locale'];
    console.warn(`Using equivalent locale: ${equivalentLocale}`);
    dispatch(setActiveLanguage(equivalentLocale));
  } else {
    console.error(`No translations found for locale: ${locale}`);
    return false;
  }
  return true;
};
