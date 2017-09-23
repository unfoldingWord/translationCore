import consts from '../actions/ActionTypes';
const initialState = {
  verses:[],
  bookName: null
};
const missingVersesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.MISSING_VERSES_CHECK:
      return {
        ...state,
        verses: action.verses,
        bookName: action.bookName
      };
    default:
      return state;
  }
};

export default missingVersesReducer;