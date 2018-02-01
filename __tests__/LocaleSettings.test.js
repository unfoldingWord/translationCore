jest.unmock('fs-extra');

import reducer from '../src/js/reducers/localeSettingsReducer';
import * as actions from '../src/js/actions/LocaleActions';
import types from '../src/js/actions/ActionTypes';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


describe('actions', () => {
  it('should create an action to open the locale screen', () => {
    const expectedAction = {
      type: types.SHOW_LOCALE_SCREEN
    };
    expect(actions.openLocaleScreen()).toEqual(expectedAction);
  });

  it('should create an action to close the locale screen', () => {
    const expectedAction = {
      type: types.CLOSE_LOCALE_SCREEN
    };
    expect(actions.closeLocaleScreen()).toEqual(expectedAction);
  });

  it('should create an action to set the active language', () => {
    let language = 'en_US';
    const expectedActions = [
      { type: types.SET_SETTING, key: 'appLocale', value: language },
      { type: '@@localize/SET_ACTIVE_LANGUAGE', payload: {languageCode: language} }
    ];
    const store = mockStore({ });
    store.dispatch(actions.setLanguage(language));
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe('create an action to initialize the locale', () => {
    it('should not use the system locale', () => {
      let defaultLanguage = 'en_US';
      let localeDir = path.join(__dirname, './fixtures/locale/');
      const expectedActionTypes = [
        '@@localize/INITIALIZE',
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', //en_US
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', // for short locale addition
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', //na_NA
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE' // for short locale addition
      ];
      const store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir, defaultLanguage)).then(() => {
        let receivedActionTypes = store.getActions().map(action => {
          return action.type;
        });
        expect(receivedActionTypes).toEqual(expectedActionTypes);
      });
    });

    it('should use the system locale', () => {
      let localeDir = path.join(__dirname, './fixtures/locale/');
      const expectedActionTypes = [
        '@@localize/INITIALIZE',
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', //en_US
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', // for short locale addition
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', //na_NA
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE', // for short locale addition
        '@@localize/SET_ACTIVE_LANGUAGE'
      ];
      const store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir)).then(() => {
        let receivedActionTypes = store.getActions().map(action => {
          return action.type;
        });
        expect(receivedActionTypes).toEqual(expectedActionTypes);
      });
    });

    it('should reject if locale dir is missing', () => {
      let localeDir = null;
      const store = mockStore({});
      return expect(store.dispatch(actions.loadLocalization(localeDir))).rejects.toEqual('Missing locale dir at null');
    });

    it('should use an equivalent locale', () => {
      let defaultLanguage = 'na_MISSING';
      let localeDir = path.join(__dirname, './fixtures/locale/');
      const expectedActionTypes = [
        {type: '@@localize/INITIALIZE', languageCode: undefined},
        {type: '@@localize/ADD_TRANSLATION_FOR_LANGUGE', languageCode: undefined}, // en_US
        {type: '@@localize/ADD_TRANSLATION_FOR_LANGUGE', languageCode: undefined}, // for short locale addition
        {type: '@@localize/ADD_TRANSLATION_FOR_LANGUGE', languageCode: undefined}, // na_NA
        {type: '@@localize/ADD_TRANSLATION_FOR_LANGUGE', languageCode: undefined}, // for short locale addition
        {type: '@@localize/SET_ACTIVE_LANGUAGE', languageCode: 'na_NA'}
      ];
      const store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir, defaultLanguage)).then(() => {
        let receivedActionTypes = store.getActions().map(action => {
          return {type: action.type, languageCode: action.payload.languageCode};
        });
        expect(receivedActionTypes).toEqual(expectedActionTypes);
      });
    });
  });
});

describe('reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      open: false
    });
  });

  it('should handle SHOW_LOCALE_SCREEN', () => {
    expect(
      reducer({}, {
        type: types.SHOW_LOCALE_SCREEN
      })
    ).toEqual({
      open: true
    });
  });

  it('should handle CLOSE_LOCALE_SCREEN', () => {
    expect(
      reducer({}, {
        type: types.CLOSE_LOCALE_SCREEN
      })
    ).toEqual({
      open: false
    });
  });
});
