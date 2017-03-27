
const initialState = {
  book: null,
  bookAbbr: null,
  groups: null,
  subgroups: null,
  currentCheck: null,
  currentGroupIndex: null,
  currentCheckIndex: null,
  currentCheckNamespace: null,
  groupName: null,
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case "SET_BOOK_NAME":
      return {
        ...state,
        book: action.book,
        bookAbbr: action.bookAbbr
      }
    case "SET_GROUPS_OBJECTS":
      return Object.assign({}, state, {
        groups: action.val,
      });
      break;
    case "SET_SUBGROUPS_OBJECTS":
      return Object.assign({}, state, {
        subgroups: action.val,
      });
      break;
    case "UPDATE_CURRENT_CHECK":
      return Object.assign({}, state, {
        currentCheck: action.val,
      });
      break;
    case "GO_TO_CHECK":
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      }
      break;
    case "GO_TO_NEXT":
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      }
      break;
    case "GO_TO_PREVIOUS":
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      }
      break;
    case "UPDATE_NAMESPACE":
      return { ...state, currentCheckNamespace: action.currentCheckNamespace }
      break;
    case "SET_GROUP_NAME":
      return { ...state, groupName: action.groupName }
      break;
    default:
      return state;
  }
}
