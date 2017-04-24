import consts from '../actions/CoreActionConsts';

const initialState = {
  displayHomeView: true
};

const BodyUIReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.TOGGLE_HOME_VIEW:
      return {
        ...state,
        displayHomeView: !state.displayHomeView
      };
    default:
      return state;
  }
};

export default BodyUIReducer;
