import consts from '../actions/ActionTypes';

const initialState = {
  show: false
};

// TODO: this is so small, the loading state should be moved into another reducer.
const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    // This is only used when loading project data
    case consts.TOGGLE_LOADER_MODAL:
      return {
        ...state,
        show: action.show || !state.show
      };
      //this is only used when opening a tool
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
