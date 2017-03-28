import consts from '../actions/CoreActionConsts';

const initialState = {
  currentSettings: {
    showTutorial: false,
    textSelect: 'drag',
    developerMode: false
  }
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SETTINGS:
      return {...state, currentSettings: action.val};
    default:
      return state;
  }
};

export default settingsReducer;
