const merge = require('lodash.merge');
const api = window.ModuleApi;

const initialState = {
  currentCheck: null,
  currentTranslationWordFile: null,
  book: null,
  currentWord: null,
  currentFile: null,
  tabKey: 1,
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case "GO_TO_CHECK":
      return merge({}, state, {
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex,
      });
      break;
    default:
      return state;
  }
}
