import consts from '../actions/CoreActionConsts';

const initialState = {
  before: null,
  after: null,
  tags: null,
  userName: null,
  modifiedTimestamp: null
};

const verseEditReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_VERSE_EDIT:
      return Object.assign({}, state, {
        before: action.before,
        after: action.after,
        tags: action.tags,
        userName: action.userName,
        modifiedTimestamp: action.modifiedTimestamp,
      });
    case consts.ADD_VERSE_EDIT_STATUS:
      return Object.assign({}, state, {
        file: action.file,
        pass: action.pass
      });
    default:
      return state;
  }
};

export default verseEditReducer;
