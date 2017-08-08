import consts from '../actions/ActionTypes';

const initialState = {
  currentSettings: {
    showTutorial: false,
    textSelect: 'drag',
    developerMode: false,
    csvSaveLocation: null,
    online: true,
    onlineMode: false
  },
  toolsSettings: {}
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SETTINGS:
      return { ...state, currentSettings: action.val }
    case consts.SET_CSV_SAVE_LOCATION:
      return { ...state, csvSaveLocation: action.csvSaveLocation }
    case consts.SET_USFM_SAVE_LOCATION:
      return { ...state, usfmSaveLocation: action.usfmSaveLocation }
    case consts.CHANGE_ONLINE_STATUS:
      return { ...state, online: action.online }
    case consts.UPDATE_TOOL_SETTINGS:
      return {
        ...state,
        toolsSettings: {
          ...state.toolsSettings,
          [action.moduleNamespace]: {
            ...state[action.moduleNamespace],
            [action.settingsPropertyName]: action.toolSettingsData
          }
        }
      };
    case consts.UPDATE_ONLINE_MODE:
      return { ...state, onlineMode: action.val }
    default:
      return state;
  }
}

export default settingsReducer;
