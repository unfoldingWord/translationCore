
const initialState = {
  book: null,
  bookAbbr: null,
  groups: null,
  subgroups: null,
  currentCheck: null,
  currentGroupIndex: null,
  currentCheckIndex: null,
  currentCheckNameSpace: null,
  groupName: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_BOOK_NAME":
      return {
        ...state,
        book: action.val,
        bookAbbr: action.bookAbbr
      };
    case "SET_GROUPS_OBJECTS":
      return Object.assign({}, state, {
        groups: action.val
      });
    case "UPDATE_CURRENT_CHECK":
      return Object.assign({}, state, {
        currentCheck: action.val
      });
    case "GO_TO_CHECK":
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      };
    case "GO_TO_NEXT":
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      };
    case "GO_TO_PREVIOUS":
      return {
        ...state,
        currentGroupIndex: action.currentGroupIndex,
        currentCheckIndex: action.currentCheckIndex
      };
    case "UPDATE_NAMESPACE":
      return {...state, currentCheckNameSpace: action.currentCheckNameSpace};
    default:
      return state;
  }
};
