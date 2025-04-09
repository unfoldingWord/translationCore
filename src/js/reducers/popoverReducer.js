import consts from '../actions/ActionTypes';

const initialState = {
  popoverVisibility: false,
  title: '',
  bodyText: '',
  positionCoord: {},
};

const popoverReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.SHOW_POPOVER:
    return {
      ...state,
      popoverVisibility: true,
      title: action.title,
      bodyText: action.bodyText,
      positionCoord: action.positionCoord,
      style: action.style,
      titleStyle: action.titleStyle,
      bodyStyle: action.bodyStyle,
    };
  case consts.CLOSE_POPOVER:
    return {
      ...state,
      popoverVisibility: false,
      title: '',
      bodyText: '',
      positionCoord: [0, 0],
    };
  default:
    return state;
  }
};

export default popoverReducer;
