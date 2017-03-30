import consts from '../actions/CoreActionConsts'

const initialState = {
  bibles: {}
};

const resourcesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_NEW_BIBLE_TO_RESOURCES:
      return {
        ...state,
        bibles: {
          ...state.bibles,
          [action.bibleName]: action.bibleData
        }
      }
    case consts.ADD_NEW_RESOURCE:
      return {
        ...state,
        [action.resourceName]: action.resourceData
      }
    default:
      return state;
  }
}

export default resourcesReducer
