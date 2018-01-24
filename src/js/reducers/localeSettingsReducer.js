import consts from '../actions/ActionTypes';
import * as fromLocale from 'react-localize-redux';
import _ from 'lodash';

const defaultState = {
  open: false
};

const localeSettings = (state = defaultState, action) => {
  switch(action.type) {
    case consts.SHOW_LOCALE_SCREEN:
      return {
        ...state,
        open: true
      };
    case consts.CLOSE_LOCALE_SCREEN:
      return {
        ...state,
        open: false
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
  let languages = fromLocale.getLanguages(state.locale);
  // TRICKY: we filter out short codes used for equivalence matching
  // because theses will appear to be duplicates (they technically are)
  languages = languages.map((language) => {
    if(language.code.indexOf('_') > -1) {
      return language;
    }
  });
  return _.without(languages, undefined);
};
