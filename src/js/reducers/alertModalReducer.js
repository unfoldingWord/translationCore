import consts from '../actions/CoreActionConsts';

const initialState = {
  visibility: false,
  title: null,
  content: null,
  leftButtonText: null,
  rightButtonText: null,
  moreInfo: null,
  response: null,
  callback: null,
  moreInfoOpen: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case consts.SHOW_ALERT_MODAL:
      return {
        ...state,
        title: action.title,
        content: action.content,
        leftButtonText: action.leftButtonText,
        rightButtonText: action.rightButtonText,
        moreInfo: action.moreInfo,
        visibility: action.visibility,
        callback: action.callback
      };
    case consts.TOGGLE_MORE_INFO:
      return {
        ...state,
        moreInfoOpen: !state.moreInfoOpen
      };
    default:
      return state;
  }
};
