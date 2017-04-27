import consts from '../actions/CoreActionConsts';

const initialState = {
  show: false,
  progress: 0,
  reloadContent: null
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return {
        ...state,
        show: action.show || !state.show
      };
    case consts.UPDATE_PROGRESS:
      return {
        ...state,
        [action.processName]: {
          progress: action.progress
        },
        reloadContent: action.reloadContent ? action.reloadContent : null
      };
    case consts.DONE_LOADING:
      return {
        ...state,
        progress: 0,
        show: false
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
