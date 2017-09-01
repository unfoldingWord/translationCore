import consts from '../actions/ActionTypes';

const initialState = {
  show: false,
  toolsProgress: {},
  showResetButton: false
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return {
        ...state,
        show: action.show || !state.show,
        showResetButton: false
      };
    case consts.UPDATE_PROGRESS:
      return {
        ...state,
        toolsProgress: {
          [action.processName]: {
            progress: action.progress
          }
        }
      };
    case consts.TOGGLE_RESET_LOADING_BUTTON:
      return {
        ...state,
        showResetButton: action.showResetButton
      }
    default:
      return state;
  }
};

export default loaderReducer;
