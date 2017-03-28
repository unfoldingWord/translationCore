const consts = require('../actions/CoreActionConsts');

const initialState = {
  toolLoaded: false,
  toolsMetadatas: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case consts.GET_TOOLS_METADATAS:
      return {...state, toolsMetadatas: action.val};
    case consts.LOAD_TOOL:
      return {...state, toolLoaded: action.val};
    default:
      return state;
  }
};
