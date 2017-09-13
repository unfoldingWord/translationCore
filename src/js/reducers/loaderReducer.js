import consts from '../actions/ActionTypes';

const initialState = {
  show: false,
  toolsProgress: {},
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return {
        ...state,
        show: action.show || !state.show,
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
    default:
      return state;
  }
};

export default loaderReducer;
