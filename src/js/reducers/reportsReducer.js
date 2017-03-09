const consts = require('../actions/CoreActionConsts');

const initialState = {
  reportVisibility: false,
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.LOAD_REPORTS:
      return { ...state, reportVisibility: action.val }
    default:
      return state;
  }
}
