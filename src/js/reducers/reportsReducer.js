const consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

const initialState = {
  reportVisibility: false,
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.LOAD_REPORTS:
      return merge({}, state, {
        reportVisibility: action.val,
      });
      break;
    default:
      return state;
  }
}
