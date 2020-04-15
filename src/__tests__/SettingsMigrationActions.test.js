import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ActionTypes from '../js/actions/ActionTypes';
// actions
import * as SettingsMigrationActions from '../js/actions/SettingsMigrationActions';
import {
  ORIGINAL_LANGUAGE, TARGET_LANGUAGE, TARGET_BIBLE,
} from '../js/common/constants';
// constants
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('SettingsMigrationActions.migrateCurrentPaneSettings1', () => {
  test('Migrates old scripture pane settings to use ult string identifier instead of ulb-en string identifier', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: 'ScripturePane',
        settingsPropertyName: 'currentPaneSettings',
        toolSettingsData: ['ult', 'ust'],
      },
    ];
    const initialState = { settingsReducer: { toolsSettings: { 'ScripturePane': { currentPaneSettings: ['ulb-en', 'udb-en'] } } } };
    // set up mock store
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
        moduleNamespace: 'ScripturePane',
        settingsPropertyName: 'currentPaneSettings',
        toolSettingsData: ['ulb', 'ugnt'],
      },
    ];
    const initialState = { settingsReducer: { toolsSettings: { 'ScripturePane': { currentPaneSettings: ['ulb', 'bhp'] } } } };
    // set up mock store
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
        moduleNamespace: 'ScripturePane',
        settingsPropertyName: 'currentPaneSettings',
        toolSettingsData: [
          {
            languageId: 'en',
            bibleId: 'ulb',
          },
          {
            languageId: ORIGINAL_LANGUAGE,
            bibleId: 'ugnt',
          },
          {
            languageId: TARGET_LANGUAGE,
            bibleId: TARGET_BIBLE,
          },
        ],
      },
    ];
    const initialState = { settingsReducer: { toolsSettings: { 'ScripturePane': { currentPaneSettings: ['ulb', 'ugnt', TARGET_LANGUAGE] } } } };
    // set up mock store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings3());

    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('SettingsMigrationActions.migrateCurrentPaneSettings4', () => {
  const expectedActions = [
    {
      type: ActionTypes.UPDATE_TOOL_SETTINGS,
      moduleNamespace: 'ScripturePane',
      settingsPropertyName: 'currentPaneSettings',
      toolSettingsData: [
        {
          languageId: 'en',
          bibleId: 'ulb',
        },
        {
          languageId: 'hi',
          bibleId: 'ulb',
        },
        {
          languageId: TARGET_LANGUAGE,
          bibleId: TARGET_BIBLE,
        },
      ],
    },
  ];

  test('Does not migrate scripture pane settings for ulb bible id in English', () => {
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: [
              {
                languageId: 'en',
                bibleId: 'ulb',
              },
              {
                languageId: 'hi',
                bibleId: 'ulb',
              },
              {
                languageId: TARGET_LANGUAGE,
                bibleId: TARGET_BIBLE,
              },
            ],
          },
        },
      },
    };
    // set up mock store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings4());

    expect(store.getActions()).toEqual(expectedActions);
  });

  test('Migrates scripture pane settings from ult bible id to ulb bible id only for Hindi', () => {
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: [
              {
                languageId: 'en',
                bibleId: 'ulb',
              },
              {
                languageId: 'hi',
                bibleId: 'ult',
              },
              {
                languageId: TARGET_LANGUAGE,
                bibleId: TARGET_BIBLE,
              },
            ],
          },
        },
      },
    };
    // set up mock store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings4());

    expect(store.getActions()).toEqual(expectedActions);
  });

  test('Migrates scripture pane settings from udb bible id to udt bible id only for Hindi', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: 'ScripturePane',
        settingsPropertyName: 'currentPaneSettings',
        toolSettingsData: [
          {
            languageId: 'en',
            bibleId: 'ust',
          },
          {
            languageId: 'hi',
            bibleId: 'udt',
          },
          {
            languageId: TARGET_LANGUAGE,
            bibleId: TARGET_BIBLE,
          },
        ],
      },
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: [
              {
                languageId: 'en',
                bibleId: 'ust',
              },
              {
                languageId: 'hi',
                bibleId: 'udb',
              },
              {
                languageId: TARGET_LANGUAGE,
                bibleId: TARGET_BIBLE,
              },
            ],
          },
        },
      },
    };
    // set up mock store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings4());

    expect(store.getActions()).toEqual(expectedActions);
  });

  test('Does not migrate scripture pane settings for udb bible id in English', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: 'ScripturePane',
        settingsPropertyName: 'currentPaneSettings',
        toolSettingsData: [
          {
            languageId: 'en',
            bibleId: 'udb',
          },
          {
            languageId: 'hi',
            bibleId: 'ulb',
          },
          {
            languageId: TARGET_LANGUAGE,
            bibleId: TARGET_BIBLE,
          },
        ],
      },
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: [
              {
                languageId: 'en',
                bibleId: 'udb',
              },
              {
                languageId: 'hi',
                bibleId: 'ulb',
              },
              {
                languageId: TARGET_LANGUAGE,
                bibleId: TARGET_BIBLE,
              },
            ],
          },
        },
      },
    };
    // set up mock store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings4());

    expect(store.getActions()).toEqual(expectedActions);
  });

  test('Migrates scripture pane settings from udt bible id to ust bible id only for English', () => {
    const expectedActions = [
      {
        type: ActionTypes.UPDATE_TOOL_SETTINGS,
        moduleNamespace: 'ScripturePane',
        settingsPropertyName: 'currentPaneSettings',
        toolSettingsData: [
          {
            languageId: 'en',
            bibleId: 'ust',
          },
          {
            languageId: 'hi',
            bibleId: 'ulb',
          },
          {
            languageId: TARGET_LANGUAGE,
            bibleId: TARGET_BIBLE,
          },
        ],
      },
    ];
    const initialState = {
      settingsReducer: {
        toolsSettings: {
          'ScripturePane': {
            currentPaneSettings: [
              {
                languageId: 'en',
                bibleId: 'udt',
              },
              {
                languageId: 'hi',
                bibleId: 'ult',
              },
              {
                languageId: TARGET_LANGUAGE,
                bibleId: TARGET_BIBLE,
              },
            ],
          },
        },
      },
    };
    // set up mock store
    const store = mockStore(initialState);
    // dispatch action
    store.dispatch(SettingsMigrationActions.migrateCurrentPaneSettings4());

    expect(store.getActions()).toEqual(expectedActions);
  });
});
