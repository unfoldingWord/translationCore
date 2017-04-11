import consts from '../actions/CoreActionConsts';

const initialState = {
  groupIndex: [],
  loadedFromFileSystem: false
};

const groupsIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_GROUPS_INDEX: {
      return Object.assign({}, state, {
        groupsIndex: action.groupsIndex
      });
    }
    case consts.LOAD_GROUPS_INDEX_FROM_FS:
      return {
        ...state,
        loadedFromFileSystem: true
      }
      break;
    default:
      return state;
  }
};

export default groupsIndexReducer;
