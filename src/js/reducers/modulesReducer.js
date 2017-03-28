import consts from '../actions/CoreActionConsts';

const initialState = {
  selectionId: null,
  commentId: null,
  verseEditId: null,
  reminderId: null,
  userName: null,
  modifiedTimestamp: null
};

const modulesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.UPDATE_MODULE_DATA_SELECTION_ID:
      return {
        ...state,
        selectionId: action.selectionId
      };
    case consts.UPDATE_MODULE_DATA_COMMENT_ID:
      return {
        ...state,
        commentId: action.commentId
      };
    case consts.UPDATE_MODULE_DATA_VERSEEDIT_ID:
      return {
        ...state,
        verseEditId: action.verseEditId
      };
    case consts.UPDATE_MODULE_DATA_REMINDER_ID:
      return {
        ...state,
        reminderId: action.reminderId
      };
    case consts.LINK_MODULE_DATA:
      return {
        ...state,
        modifiedTimestamp: action.modifiedTimestamp,
        userName: action.userName
      };
    default:
      return state;
  }
};

export default modulesReducer;
