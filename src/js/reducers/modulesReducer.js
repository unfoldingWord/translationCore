import consts from '../actions/CoreActionConsts'

const initialState = {
  selectionId: null,
  commentId: null,
  verseEditId: null,
  reminderId: null,
  userName: null,
  modifiedTimestamp: null
}

const modulesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.LINK_MODULE_DATA:
      return Object.assign({}, state, {
        selectionId: action.selectionId,
        commentId: action.commentId,
        verseEditId: action.verseEditId,
        reminderId: action.reminderId,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp
      })
    default:
      return state;
  }
}

export default modulesReducer;
