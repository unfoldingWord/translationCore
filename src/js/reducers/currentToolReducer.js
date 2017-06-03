import consts from '../actions/ActionTypes';

const initialState = {
  toolName: null,
  isDataFetched: false
}

const currentToolReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_TOOL_NAME:
      return {
        ...state,
        toolName: action.toolName
      }
    case consts.SET_TOOL_TITLE:
      return {
        ...state,
        toolTitle: action.toolTitle
      }
    case consts.SET_FETCHED_DATA:
      return {
        ...state,
        isDataFetched: action.isDataFetched
      }
    case consts.CLEAR_CURRENT_TOOL:
      return initialState;
    default:
      return state
  }
}

export default currentToolReducer
