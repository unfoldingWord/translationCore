const consts = require('../actions/CoreActionConsts');

const initialState = {
  recentProjects: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case consts.GET_RECENT_PROJECTS:
      return {...state, recentProjects: action.recentProjects};
    default:
      return state;
  }
};
