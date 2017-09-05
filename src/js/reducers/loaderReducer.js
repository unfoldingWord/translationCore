import consts from '../actions/ActionTypes';

const initialState = {
  show: false,
  toolsProgress: {},
  showCancelButton: false
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return {
        ...state,
        show: action.show || !state.show,
        showCancelButton: false
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
    case consts.TOGGLE_CANCEL_LOADING_BUTTON:
      return {
        ...state,
        showCancelButton: action.showCancelButton
      }
    default:
      return state;
  }
};

export default loaderReducer;
