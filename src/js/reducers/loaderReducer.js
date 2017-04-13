import consts from '../actions/CoreActionConsts';

const initialState = {
  show: false,
  progress: 0,
  reloadContent: null
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_LOADER_MODAL:
      return { ...state, show: action.show || !state.show }
      break;
    case consts.UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.progress,
        reloadContent: action.reloadContent,
        show: true
      }
      break;
    case consts.DONE_LOADING:
      return {
        ...state,
        progress: 0,
        show: false
      }
      break;
    case consts.START_LOADING:
      return {
        ...state,
        show: true
      }
    default:
      return state;
  }
}
