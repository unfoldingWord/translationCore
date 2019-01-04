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

export const getGroupsIndex = (state) => 
  state.groupsIndex;

function sortIndexBasedOnId(a, b) {
  // if the id string contains chapter_ then remove it so that it doesnt mess up with the sorting
  // otherwise it'd leave it alone
  const A = a.id.includes('chapter_') ? parseInt(a.id.replace('chapter_', ''), 10) : a.id;
  const B = b.id.includes('chapter_') ? parseInt(b.id.replace('chapter_', ''), 10) : b.id;

  if (A < B)
    return -1;
  if (A > B)
    return 1;
  return 0;
}

export default groupsIndexReducer;
