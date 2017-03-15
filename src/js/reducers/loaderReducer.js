const consts = require('../actions/CoreActionConsts');

const initialState = {
  modules: {},
  show: false
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return { ...state, show: !state.show }
    case consts.SAVE_MODULE:
      state.modules[action.identifier] = action.module;
      return {
        ...state,
        modules: {
          ...state.modules,
        }
      }
    default:
      return state;
    }
}
