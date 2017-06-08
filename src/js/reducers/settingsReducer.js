import consts from '../actions/ActionTypes';

const initialState = {
  currentSettings: {
    showTutorial: false,
    textSelect: 'drag',
    developerMode: false,
    csvSaveLocation: null
  }
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SETTINGS:
      return { ...state, currentSettings: action.val }
    case consts.CSV_SAVE_LOCATION:
      return { ...state, csvSaveLocation: action.csvSaveLocation }
    default:
      return state;
  }
}

export default settingsReducer
