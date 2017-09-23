import consts from '../actions/ActionTypes';

const initialState = {
  projects: []
};

const myProjectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.GET_MY_PROJECTS:
      return {
        ...state,
        projects: action.projects
      };
    default:
      return state;
  }
};

export default myProjectsReducer;
