const merge = require('lodash.merge');
const api = window.ModuleApi;
const CoreStore = require('../stores/CoreStore.js');

//let currentNAMESPACE = CoreStore.getCurrentCheckNamespace();
let currentNAMESPACE = "TranslationNotesChecker";

const initialState = {
  currentNAMESPACE: currentNAMESPACE,
  book: api.getDataFromCheckStore(currentNAMESPACE, 'book'),
  groups: api.getDataFromCheckStore(currentNAMESPACE, 'groups'),
  currentGroupIndex: api.getDataFromCheckStore(currentNAMESPACE, 'currentGroupIndex'),
  currentCheckIndex: api.getDataFromCheckStore(currentNAMESPACE, 'currentCheckIndex'),
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case "GO_TO_CHECK":
      return merge({}, state, {
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex,
      });
      break;
    case "GO_TO_NEXT":
      return merge({}, state, {
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex,
      });
      break;
    case "GO_TO_PREVIOUS":
      return merge({}, state, {
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex,
      });
      break;
    default:
      return state;
  }
}
