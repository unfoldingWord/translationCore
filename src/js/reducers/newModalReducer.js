const consts = require('../actions/CoreActionConsts');

const initialState = {
    visible: false,
    currentTab: 1,
    currentSection: 0
}
module.exports = (state = initialState, action) => {
    switch (action.type) {
      case consts.SHOW_MODAL_CONTAINER:
        return {
          ...state,
          visible: action.val,
          currentSection: 1
        }
      case consts.SELECT_MODAL_TAB:
        return {
          ...state,
          visible:action.visible,
          currentTab:action.tab,
          currentSection:action.section
        }
      case consts.SELECT_MODAL_SECTION:
        return {
          ...state,
          currentTab:action.tab,
          currentSection:action.section
        }
      default:
          return state;
    }
}
