import consts from '../actions/ActionTypes';

const initialState = {
  book: null,
  bookAbbr: null,
  groups: null,
  subgroups: null,
  currentCheck: null,
  currentGroupIndex: null,
  currentCheckIndex: null,
  currentCheckNamespace: null,
  groupName: null
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_BOOK_NAME:
      return {
        ...state,
        book: action.book,
        bookAbbr: action.bookAbbr
      };
    case consts.SET_GROUPS_OBJECTS:
      return {
        ...state,
        groups: action.val
      };
    case consts.SET_SUBGROUPS_OBJECTS:
      return {
        ...state,
        subgroups: action.val
      };
    case consts.UPDATE_CURRENT_CHECK:
      return {
        ...state,
        currentCheck: action.val
      };
    case consts.GO_TO_CHECK:
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      };
    case consts.GO_TO_NEXT:
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      };
    case consts.GO_TO_PREVIOUS:
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      }
    case consts.UPDATE_NAMESPACE:
      return {
        ...state,
        currentCheckNamespace: action.currentCheckNamespace
      };
    case consts.SET_GROUP_NAME:
      return {
        ...state,
        groupName: action.groupName
      };
    default:
      return state;
  }
};
