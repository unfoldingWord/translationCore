import consts from '../actions/ActionTypes';

const initialState = {
  groupsIndex: [],
  loadedFromFileSystem: false,
  refreshCount: 0,
};

const groupsIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.LOAD_GROUPS_INDEX: {
      return {
        ...state,
        groupsIndex: [
          ...state.groupsIndex,
          ...action.groupsIndex,
        ].sort(sortIndexBasedOnId),
        loadedFromFileSystem: true
      };
    }
    case consts.UPDATE_REFRESH_COUNT_GROUPS_INDEX: {
      return {
        ...state,
        refreshCount: state.refreshCount+1
      };
    }
    case consts.CLEAR_PREVIOUS_GROUPS_INDEX:
      return initialState;
    default:
      return state;
  }
};

function sortIndexBasedOnId(a, b) {
  if (a.id < b.id)
    return -1;
  if (a.id > b.id)
    return 1;
  return 0;
}

export default groupsIndexReducer;
