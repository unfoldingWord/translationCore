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
        modifiedTimestamp: action.modifiedTimestamp
      });
    default:
      return state;
  }
};

export default verseEditReducer;
