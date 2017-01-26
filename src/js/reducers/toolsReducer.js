const consts = require('../actions/CoreActionConsts');
const merge = require('lodash.merge');

const initialState = {
  toolLoaded: false,
  toolsMetadatas: [],
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.GET_TOOLS_METADATAS:
      return merge({}, state, {
        toolsMetadatas: action.val,
      });
      break;
    case consts.LOAD_TOOL:
      return merge({}, state, {
        toolLoaded: action.val,
      });
      break;
    default:
      return state;
  }
}
