import actionTypes from '../actions/ActionTypes';

const initialState = {
    recentProjects: null
};

const recentProjectsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_RECENT_PROJECTS:
          return { ...state, recentProjects: action.recentProjects };
        default:
            return state;
    }
};

export default recentProjectsReducer;