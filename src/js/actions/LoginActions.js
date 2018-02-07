import types from './ActionTypes';
import {getTranslate} from '../selectors';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ProjectLoadingActions from './MyProjects/ProjectLoadingActions';
import * as BodyUIActions from './BodyUIActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
// helpers
import * as GogsApiHelpers from '../helpers/GogsApiHelpers';

export function loginUser(newUserdata, local = false) {
  return (dispatch, getState) => {
    const translate = getTranslate(getState());
    if (local) {
      dispatch({
        type: types.LOGIN_USER,
        userdata: newUserdata,
        localUser: local
      });
    } else {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
        GogsApiHelpers.login(newUserdata).then(newUserdata => {
          dispatch({
            type: types.LOGIN_USER,
            userdata: newUserdata
          });
          dispatch(BodyUIActions.goToStep(1));
        }).catch(function (err) {
          let errmessage = translate('home.users.login_error');
          if (err.syscall === "getaddrinfo") {
            errmessage = translate('unable_to_connect_to_server');
          } else if (err.status === 404) {
            errmessage = translate('home.users.incorrect_username');
          } else if (err.status === 401) {
            errmessage = translate('home.users.incorrect_password');
          }
          dispatch(AlertModalActions.openAlertDialog(errmessage));
        });
      }));
    }
    dispatch(BodyUIActions.goToStep(1));
  };
}

export function logoutUser() {
  return ((dispatch) => {
    localStorage.removeItem('localUser');
    localStorage.removeItem('user');
    dispatch({
      type: types.LOGOUT_USER
    });
    dispatch(ProjectLoadingActions.clearLastProject());
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch({ type: types.RESET_ONLINE_MODE_WARNING_ALERT });
    dispatch(BodyUIActions.goToStep(1));
  });
}
