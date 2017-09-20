import consts from '../actions/ActionTypes';

const initialState = {
  target: {},
  wordBank: {}
}

const wordAlignmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_ALIGNMENT_DATA_FOR_CURRENT_CHAPTER:
      return {
        ...state,
        target: {
          [action.chapter]: action.payload
        }
      }
    case consts.ADD_SOURCE_DATA_TO_WORD_BANK:
      return {
        ...state,
        wordBank: {
          [action.chapter]: action.payload
        }
      }
    case consts.MOVE_SOURCE_WORD_TO_TARGET_BOX:
      return {
        ...state,
        target: action.payload
      }
    case consts.UPDATE_WORD_BANK_LIST:
      return {
        ...state,
        wordBank: {
          [action.chapter]: {
            ...state.wordBank[action.chapter],
            [action.verse]: action.newWordList
          }
        }
      }
    default:
      return state
  }
}

export default wordAlignmentReducer;
