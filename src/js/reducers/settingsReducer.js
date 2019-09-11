import types from '../actions/ActionTypes';

const initialState = {
  currentSettings: {
    showTutorial: false,
    developerMode: false,
    csvSaveLocation: null,
    online: true,
    onlineMode: false,
    usfmExportType: 'usfm2',
  },
  toolsSettings: {},
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
  case types.SET_SETTING:
    // TODO: move settings into root object
    return {
      ...state,
      currentSettings: {
        ...state.currentSettings,
        [action.key]: action.value,
      },
    };
  case types.TOGGLE_SETTING:
    // TODO: move settings into root object
    return {
      ...state,
      currentSettings: {
        ...state.currentSettings,
        [action.key]: !state.currentSettings[action.key],
      },
    };
    // TODO: these should all be deprecated in favor of SET_SETTING
  case types.SET_CSV_SAVE_LOCATION:
    return { ...state, csvSaveLocation: action.csvSaveLocation };
  case types.SET_USFM_SAVE_LOCATION:
    return { ...state, usfmSaveLocation: action.usfmSaveLocation };
  case types.CHANGE_ONLINE_STATUS: // deprecated there's no action for this
    return { ...state, online: action.online };
  case types.UPDATE_TOOL_SETTINGS:
    return {
      ...state,
      toolsSettings: {
        ...state.toolsSettings,
        [action.moduleNamespace]: {
          ...state[action.moduleNamespace],
          [action.settingsPropertyName]: action.toolSettingsData,
        },
      },
    };
  case types.UPDATE_ONLINE_MODE:
    return { ...state, onlineMode: action.val };
  case types.RESET_ONLINE_MODE_WARNING_ALERT:
    return {
      ...state,
      onlineMode: false,
    };
  default:
    return state;
  }
};

export default settingsReducer;

/**
 * Retrieves a saved setting.
 * This is the compliment of SettingsActions.setSetting
 * @param {object} state
 * @param {string} key the setting key
 * @return {*} the setting value or undefined if it does not exist
 */
export const getSetting = (state, key) => {
  if (key in state.currentSettings) {
    return state.currentSettings[key];
  } else {
    return undefined;
  }
};
