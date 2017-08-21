import consts from '../actions/ActionTypes';

const initialState = {
  menuVisibility: true,
  isSubMenuExpanded: true
};

const groupMenuReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.GROUP_MENU_EXPAND_SUBMENU:
      return {
        ...state,
        isSubMenuExpanded: action.isSubMenuExpanded
      }
    case consts.TOGGLE_MENU_DRAWER:
      return { ...state, menuVisibility: !state.menuVisibility }
    default:
      return state;
  }
}

export default groupMenuReducer;
