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
    moreInfoOpen: false,
    alertDialogVisibility: false,
    alertDialogLoading: false,
    alertText: null
};

const alertModalReducer = (state = initialState, action) => {
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
        callback: action.callback,
      }
    case consts.TOGGLE_MORE_INFO:
      return {
        ...state,
        moreInfoOpen: !state.moreInfoOpen
      }
    case consts.OPEN_ALERT_DIALOG:
      return {
        ...state,
        alertDialogVisibility: true,
        alertDialogLoading: action.loading,
        alertText: action.alertMessage,
        button1: null,
        button2: null,
        callback: null
      }
    case consts.CLOSE_ALERT_DIALOG:
      return {
        ...state,
        alertDialogVisibility: false,
        alertDialogLoading: false,
      }
    case consts.OPEN_OPTION_DIALOG:
      return {
        ...state,
        alertDialogVisibility: true,
        alertDialogLoading: false,
        alertText: action.alertMessage,
        button1: action.button1Text,
        button2: action.button2Text,
        callback: action.callback
      }
    default:
      return state;
  }
}

export default alertModalReducer;
