const consts = require('../actions/CoreActionConsts');

const initialState = {
  currentSettings: {},
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.CHANGE_SETTINGS:
      return { ...state, currentSettings: action.val }
    default:
      return state;
  }
}
