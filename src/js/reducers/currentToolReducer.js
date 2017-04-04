import consts from '../actions/CoreActionConsts';

const initialState = {
  toolName: null
}

const currentToolReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_TOOL_NAME:
      return {
        toolName: action.toolName
      }
    default:
      return state
  }
}

export default currentToolReducer
