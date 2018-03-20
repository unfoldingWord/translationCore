import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ActionTypes from '../src/js/actions/ActionTypes';
// actions
import * as SettingsMigrationActions from '../src/js/actions/SettingsMigrationActions';
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('SettingsMigrationActions.migrateCurrentPaneSettings1', () => {
  test('Migrates old scripture pane settings to use ult string identifier instead of ulb-en string identifier', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: "ScripturePane",
        settingsPropertyName: "currentPaneSettings",
        toolSettingsData: ['ult', 'udt']
      }
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: ['ulb-en', 'udb-en']
          }
        }
      }
    };
    // set up mok store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings1());

    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('SettingsMigrationActions.migrateCurrentPaneSettings2', () => {
  test('Replaces "bhp" identifier with "ugnt" identifier from scripture pane settings', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: "ScripturePane",
        settingsPropertyName: "currentPaneSettings",
        toolSettingsData: ['ulb', 'ugnt']
      }
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: ['ulb', 'bhp']
          }
        }
      }
    };
    // set up mok store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings2());

    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('SettingsMigrationActions.migrateCurrentPaneSettings3', () => {
  test('Migrates pane settings from string identifiers to objects that include both languageId and bibleId', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: "ScripturePane",
        settingsPropertyName: "currentPaneSettings",
        toolSettingsData: [
          {
            languageId: 'en',
            bibleId: 'ulb'
          },
          {
            languageId: 'originalLanguage',
            bibleId: 'ugnt'
          },
          {
            languageId: 'targetLanguage',
            bibleId: 'targetBible'
          }
        ]
      }
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: ['ulb', 'ugnt', 'targetLanguage']
          }
        }
      }
    };
    // set up mok store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings3());

    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('SettingsMigrationActions.migrateCurrentPaneSettings4', () => {
  test('Migrates scriptrue pane settings from ulb bible id to ult bible id', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: "ScripturePane",
        settingsPropertyName: "currentPaneSettings",
        toolSettingsData: [
          {
            languageId: 'en',
            bibleId: 'ult'
          },
          {
            languageId: 'hi',
            bibleId: 'ult'
          },
          {
            languageId: 'targetLanguage',
            bibleId: 'targetBible'
          }
        ]
      }
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: [
              {
                languageId: 'en',
                bibleId: 'ulb'
              },
              {
                languageId: 'hi',
                bibleId: 'ulb'
              },
              {
                languageId: 'targetLanguage',
                bibleId: 'targetBible'
              }
            ]
          }
        }
      }
    };
    // set up mok store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings4());

    expect(store.getActions()).toEqual(expectedActions);
  });
});
