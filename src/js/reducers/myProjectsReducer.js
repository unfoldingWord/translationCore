import types from '../actions/ActionTypes';

const initialState = { projects: [] };

const myProjectsReducer = (state = initialState, action) => {
  switch (action.type) {
  case types.GET_MY_PROJECTS:
    return {
      ...state,
      projects: action.projects,
    };
  case types.ARCHIVE_PROJECT:
    return { projects: state.projects.filter(p => p.projectSaveLocation !== action.path) };
  default:
    return state;
  }
};

export default myProjectsReducer;

/**
 * Returns the user's projects
 * @param state
 * @return {object[]}
 */
export const getProjects = state => [...state.projects];
