import consts from '../actions/ActionTypes';

const initialState = {
  menuVisibility: true,
  isSubMenuExpanded: true,
  filters: {
    invalidated: false,
    reminders: false,
    selections: false,
    noSelections: false,
    verseEdits: false,
    comments: false,
  },
};

const groupMenuReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.GROUP_MENU_EXPAND_SUBMENU:
    return {
      ...state,
      isSubMenuExpanded: action.isSubMenuExpanded,
    };
  case consts.TOGGLE_MENU_DRAWER:
    return { ...state, menuVisibility: !state.menuVisibility };
  case consts.GROUP_MENU_SET_FILTER:
    return {
      ...state,
      filters: {
        ...state.filters,
        [action.name]: action.value,
      },
    };
  case consts.CLEAR_PREVIOUS_FILTERS:
    return {
      ...state,
      filters: initialState.filters,
    };
  default:
    return state;
  }
};

export default groupMenuReducer;
