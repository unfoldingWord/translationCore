/* eslint-disable array-callback-return */
import * as fromLocale from 'react-localize-redux';
import _ from 'lodash';
import types from '../actions/ActionTypes';

const defaultState = { loaded: false };

const localeSettings = (state = defaultState, action) => {
  switch (action.type) {
  case types.LOCALE_LOADED:
    return {
      ...state,
      loaded: true,
    };
  default:
    return state;
  }
};

export default localeSettings;

/**
 * This is a wrapper around the library function getLanguages.
 * It passes the correct state key to the library function.
 * @param {object} state the root state object
 * @return {Language[]} a list of languages
 */
export const getLanguages = (state) => {
  let languages = fromLocale.getLanguages(state.localize);

  // TRICKY: we filter out short codes used for equivalence matching
  // because theses will appear to be duplicates (they technically are)
  languages = languages.map((language) => {
    if (language.code.indexOf('_') > -1) {
      return language;
    }
  });
  return _.without(languages, undefined);
};

/**
 * Returns the active language.
 * This is a wrapper around the library function.
 * it passes the correct state key to the function.
 * @param {object} state the root state object
 * @return {Language}
 */
export const getActiveLanguage = (state) =>
  fromLocale.getActiveLanguage(state.localize);

/**
 * Checks if the locale is loaded
 * @param {*} state
 * @return {bool}
 */
export const getLocaleLoaded = (state) =>
  state.loaded;

/**
 *
 * Returns the translate function.
 * This is a wrapper around the library function
 * @param {object} state the root state object
 * @return {Translate}
 */
export const getTranslate = (state) =>
  fromLocale.getTranslate(state.localize);
