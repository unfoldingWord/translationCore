import path from 'path';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';
import reducer from '../src/js/reducers/localeSettings';
import * as actions from '../src/js/actions/LocaleActions';
import types from '../src/js/actions/ActionTypes';

jest.unmock('fs-extra');
jest.unmock('react-localize-redux');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


describe('actions', () => {
  let store = mockStore({});

  function addTranslationForLanguage(translation, languageCode) {
    return store.dispatch({
      type: '@@localize/ADD_TRANSLATION_FOR_LANGUAGE',
      payload: { translation, languageCode },
    });
  }

  const setActiveLanguage = (languageCode) => ({
    type: '@@localize/SET_ACTIVE_LANGUAGE',
    payload: { languageCode },
  });

  const initialize = () => store.dispatch({
    type: '@@localize/INITIALIZE',
    payload: {},
  });

  it('should create an action to set the locale loaded', () => {
    const expectedAction = { type: types.LOCALE_LOADED };
    expect(actions.setLocaleLoaded()).toEqual(expectedAction);
  });

  it('should create an action to set the active language', () => {
    let language = 'en_US';
    const expectedActions = [
      {
        type: types.SET_SETTING, key: 'appLocale', value: language,
      },
      { type: '@@localize/SET_ACTIVE_LANGUAGE', payload: { languageCode: language } },
    ];
    store = mockStore({});
    store.dispatch(actions.setLanguage(language, setActiveLanguage));
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe('create an action to initialize the locale', () => {
    it('should inject non-translatable strings', () => {
      let localeDir = path.join(__dirname, './fixtures/locale');
      store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir, 'en_US', initialize, addTranslationForLanguage, setActiveLanguage)).then(() => {
        let addTranslationActions = store.getActions().map(action => {
          if (action.type === '@@localize/ADD_TRANSLATION_FOR_LANGUAGE') {
            return action;
          }
        });
        addTranslationActions = _.compact(addTranslationActions);
        expect(addTranslationActions).toHaveLength(4);
        const action = addTranslationActions[0];
        const translation = action.payload.translation;
        expect(translation).toHaveProperty('_');
        expect(translation._).toHaveProperty('app_name');
        expect(translation._).toHaveProperty('locale');
        expect(translation._).toHaveProperty('language_name');
      });
    });

    it('should not use the system locale', () => {
      let defaultLanguage = 'en_US';
      let localeDir = path.join(__dirname, './fixtures/locale');
      const expectedActionTypes = [
        '@@localize/INITIALIZE',
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', //en_US
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', // for short locale addition
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', //na_NA
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', // for short locale addition
        'LOCALE_LOADED',
      ];
      store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir, defaultLanguage, initialize, addTranslationForLanguage, setActiveLanguage)).then(() => {
        let receivedActionTypes = store.getActions().map(action => action.type);
        expect(receivedActionTypes).toEqual(expectedActionTypes);
      });
    });

    it('should use the system locale', () => {
      let localeDir = path.join(__dirname, './fixtures/locale');
      const expectedActionTypes = [
        '@@localize/INITIALIZE',
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', //en_US
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', // for short locale addition
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', //na_NA
        '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', // for short locale addition
        '@@localize/SET_ACTIVE_LANGUAGE',
        'LOCALE_LOADED',
      ];
      store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir, null, initialize, addTranslationForLanguage, setActiveLanguage)).then(() => {
        let receivedActionTypes = store.getActions().map(action => action.type);
        expect(receivedActionTypes).toEqual(expectedActionTypes);
      });
    });

    it('should reject if locale dir is missing', () => {
      let localeDir = null;
      store = mockStore({});
      return expect(store.dispatch(actions.loadLocalization(localeDir, null, initialize, addTranslationForLanguage, setActiveLanguage))).rejects.toEqual('Missing locale dir at null');
    });

    it('should use an equivalent locale', () => {
      let defaultLanguage = 'na_MISSING';
      let localeDir = path.join(__dirname, './fixtures/locale');
      const expectedActionTypes = [
        { type: '@@localize/INITIALIZE', languageCode: undefined },
        { type: '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', languageCode: 'en_US' }, // en_US
        { type: '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', languageCode: 'en' }, // for short locale addition
        { type: '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', languageCode: 'na_NA' }, // na_NA
        { type: '@@localize/ADD_TRANSLATION_FOR_LANGUAGE', languageCode: 'na' }, // for short locale addition
        { type: '@@localize/SET_ACTIVE_LANGUAGE', languageCode: 'na_NA' },
        { type: 'LOCALE_LOADED' },
      ];
      store = mockStore({});
      return store.dispatch(actions.loadLocalization(localeDir, defaultLanguage, initialize, addTranslationForLanguage, setActiveLanguage)).then(() => {
        let receivedActionTypes = store.getActions().map(action => {
          if (action.type.startsWith('@@localize')) {
            return { type: action.type, languageCode: action.payload.languageCode };
          } else {
            return { type: action.type };
          }
        });
        expect(receivedActionTypes).toEqual(expectedActionTypes);
      });
    });
  });
});

describe('reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({ loaded: false });
  });

  it('should handle LOCALE_LOADED', () => {
    expect(
      reducer({}, { type: types.LOCALE_LOADED })
    ).toEqual({ loaded: true });
  });
});
