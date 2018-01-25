jest.unmock('fs-extra');

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
      { type: types.SET_APP_LOCALE, locale: language },
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
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE',
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
        '@@localize/ADD_TRANSLATION_FOR_LANGUGE',
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
  });

});
