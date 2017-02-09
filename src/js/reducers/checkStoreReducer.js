const merge = require('lodash.merge');
const api = window.ModuleApi;


const initialState = {
  book: null,
  groups: null,
  currentCheck: null,
  currentGroupIndex: null,
  currentCheckIndex: null,
  currentCheckNameSpace:null
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case "SET_BOOK_NAME":
      return merge({}, state, {
        book: action.val,
      });
      break;
    case "SET_GROUPS_OBJECTS":
      return Object.assign({}, state, {
        groups: action.val,
      });
      break;
    case "UPDATE_CURRENT_CHECK":
      return Object.assign({}, state, {
        currentCheck: action.val,
      });
      break;
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
      case "UPDATE_NAMESPACE":
      return merge ({}, state, {
        currentCheckNameSpace:action.currentCheckNameSpace
      });
    default:
      return state;
  }
}
