const consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

const initialState = {
  show: false
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return merge({}, state, {
        show: !state.show
      });
      break;
      default:
        return state;
    }
}
