import reducer from '../js/reducers/settingsReducer';
import * as actions from '../js/actions/SettingsActions';
import types from '../js/actions/ActionTypes';

describe('actions', () => {
  it('should create an action to set a setting', () => {
    const key = 'setting_key';
    const value = 'setting_value';
    const expectedAction = {
      type: types.SET_SETTING,
      key,
      value,
    };
    expect(actions.setSetting(key, value)).toEqual(expectedAction);
  });

  it('should create an action to toggle a setting', () => {
    const key = 'setting_key';
    const expectedAction = {
      type: types.TOGGLE_SETTING,
      key,
    };
    expect(actions.toggleSetting(key)).toEqual(expectedAction);
  });

  it('should create an action to set tool settings', () => {
    const moduleNamespace = 'namespace';
    const settingsPropertyName = 'property';
    const toolSettingsData = { data: 'test' };
    const expectedAction = {
      type: types.UPDATE_TOOL_SETTINGS,
      moduleNamespace,
      settingsPropertyName,
      toolSettingsData,
    };
    expect(actions.setToolSettings(moduleNamespace, settingsPropertyName, toolSettingsData)).toEqual(expectedAction);
  });
});

describe('reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      currentSettings: {
        'showTutorial': false,
        'usfmExportType': 'usfm2',
        'developerMode': false,
        'csvSaveLocation': null,
        'online': true,
        'onlineMode': false,
      },
      toolsSettings: {},
    });
  });

  it('should handle SET_SETTING', () => {
    expect(
      reducer({ currentSettings: {} }, {
        type: types.SET_SETTING,
        key: 'mySetting',
        value: 'myValue',
      }),
    ).toEqual({ currentSettings: { mySetting: 'myValue' } });
  });

  it('should handle TOGGLE_SETTING', () => {
    expect(
      reducer({ currentSettings: { setting: 'string' } }, {
        type: types.TOGGLE_SETTING,
        key: 'setting',
      }),
    ).toEqual({ currentSettings: { setting: false } });
    expect(
      reducer({ currentSettings: { setting: true } }, {
        type: types.TOGGLE_SETTING,
        key: 'setting',
      }),
    ).toEqual({ currentSettings: { setting: false } });
    expect(
      reducer({ currentSettings: { setting: false } }, {
        type: types.TOGGLE_SETTING,
        key: 'setting',
      }),
    ).toEqual({ currentSettings: { setting: true } });
  });
});
