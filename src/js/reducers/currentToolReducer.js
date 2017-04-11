import consts from '../actions/CoreActionConsts';

const initialState = {
  toolName: null,
  dataFetched: false
}

const currentToolReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_TOOL_NAME:
      return {
        ...state,
        toolName: action.toolName
      }
    case consts.SET_DATA_FETCHED:
      return {
        ...state,
        dataFetched: action.dataFetched
      }
    default:
      return state
  }
}

export default currentToolReducer
