import consts from '../actions/ActionTypes';

const initialState = {
  show: false,
  toolsProgress: {},
  reloadContent: null
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return {
        ...state,
        show: action.show || !state.show
      };
    case consts.UPDATE_PROGRESS:
      return {
        ...state,
        toolsProgress: {
          [action.processName]: {
            progress: action.progress
          }
        },
        reloadContent: action.reloadContent ? action.reloadContent : null
      };
    case consts.START_LOADING:
      return {
        ...state,
        show: true
      };
    default:
      return state;
  }
};

export default loaderReducer;
