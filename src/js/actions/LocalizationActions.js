/**
 * These actions are used for controlling localization within the application.
 */

import {initialize, addTranslation, setActiveLanguage} from 'react-localize-redux';

/**
 * This thunk loads the localization data
 * and initializes the localization library.
 *
 * @return {function(*)}
 */
export const loadLocalization = () => {
  return (dispatch) => {
    // TODO: load the localization files
    const languages = [
      { name: 'English', code: 'en' }
    ];
    const translations = {};
    dispatch(initialize(languages, { defaultLanguage: 'en'}));
    dispatch(addTranslation(translations));
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
