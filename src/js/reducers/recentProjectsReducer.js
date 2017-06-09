import consts from '../actions/ActionTypes';

const initialState = {
    recentProjects: null,
};

const recentProjectsReducer = (state = initialState, action) => {
    switch (action.type) {
        case consts.GET_RECENT_PROJECTS:
          return { ...state, recentProjects: action.recentProjects }
        default:
            return state;
    }
}

export default recentProjectsReducer;