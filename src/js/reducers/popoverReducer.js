const consts = require('../actions/CoreActionConsts');

const initialState = {
  popoverVisibility: false,
  title: '',
  bodyText: '',
  positionCoord: [0, 0]
};

export default (state = initialState, action) => {
  switch (action.type) {
    case consts.SHOW_POPOVER:
      return {
        ...state,
        popoverVisibility: true,
        title: action.title,
        bodyText: action.bodyText,
        positionCoord: action.positionCoord
      };
    case consts.CLOSE_POPOVER:
      return {
        ...state,
        popoverVisibility: false,
        title: '',
        bodyText: '',
        positionCoord: [0, 0]
      };
    default:
      return state;
  }
};
