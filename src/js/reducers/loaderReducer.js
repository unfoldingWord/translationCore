const consts = require('../actions/CoreActionConsts');

const initialState = {
  show: false
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return { ...state, show: !state.show }
    default:
      return state;
    }
}
