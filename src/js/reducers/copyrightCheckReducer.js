import consts from '../actions/ActionTypes';

const initialState = {
  selectedProjectLicense: null
};

const copyrightCheckReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SELECT_PROJECT_LICENSE:
      return {
        ...state,
        selectedProjectLicense: action.selectedProjectLicense
      }
    default:
      return state;
  }
};

export default copyrightCheckReducer;
