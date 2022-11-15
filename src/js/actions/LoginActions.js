import { getTranslate } from '../selectors';
import * as GogsApiHelpers from '../helpers/GogsApiHelpers';
import { LOCAL_USER, USER } from '../common/constants';
import types from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as ProjectLoadingActions from './MyProjects/ProjectLoadingActions';
import * as BodyUIActions from './BodyUIActions';
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';
// helpers

export function loginUser(newUserdata, local = false) {
  return (dispatch, getState) => {
    const translate = getTranslate(getState());

    if (local) {
      dispatch({
        type: types.LOGIN_USER,
        userdata: newUserdata,
        localUser: local,
      });
    } else {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
        GogsApiHelpers.login(newUserdata).then(newUserdata => {
          dispatch({
            type: types.LOGIN_USER,
            userdata: newUserdata,
          });
          dispatch(BodyUIActions.goToStep(1));
        }).catch(function (err) {
          let errmessage = translate('users.login_error');

          if (err.syscall === 'getaddrinfo') {
            errmessage = translate('no_internet');
          } else if (err.status === 404) {
            errmessage = translate('users.username_error');
          } else if (err.status === 401) {
            errmessage = translate('users.password_error');
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
    localStorage.removeItem(LOCAL_USER);
    localStorage.removeItem(USER);
    dispatch({ type: types.LOGOUT_USER });
    dispatch(ProjectLoadingActions.closeProject());
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch({ type: types.RESET_ONLINE_MODE_WARNING_ALERT });
    dispatch(BodyUIActions.goToStep(1));
  });
}
