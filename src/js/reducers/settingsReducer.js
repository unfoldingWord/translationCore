import consts from '../actions/ActionTypes';

const initialState = {
  currentSettings: {
    showTutorial: false,
    textSelect: 'drag',
    developerMode: false,
    csvSaveLocation: null,
    online: true
  }
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SETTINGS:
      return { ...state, currentSettings: action.val }
    case consts.SET_CSV_SAVE_LOCATION:
      return { ...state, csvSaveLocation: action.csvSaveLocation }
    case consts.CHANGE_ONLINE_STATUS:
      return { ...state, online: action.online }
    default:
      return state;
  }
}

export default settingsReducer;
