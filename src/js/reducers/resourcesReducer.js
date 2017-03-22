import consts from '../actions/CoreActionConsts'

const initialState = {
  bibles: {},
  resources: {}
};

const resourcesReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.ADD_NEW_BIBLE_TO_RESOURCES:
      state.bibles[action.bibleName] = action.bibleData;
      return {
        ...state,
        bibles: {
          ...state.bibles
        }
      }
    case consts.ADD_NEW_RESOURCE:
      state.resources[action.resourceName] = action.resourceData;
      return {
        ...state,
        resources:{
          ...state.resources
        }
      }
    default:
      return state;
  }
}

export default resourcesReducer
