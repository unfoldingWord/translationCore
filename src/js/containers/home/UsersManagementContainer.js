import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
// actions
import * as PopoverActions from '../../actions/PopoverActions';
import * as LoginActions from '../../actions/LoginActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
// components
import LoginContainer from '../../components/home/usersManagement';
import Logout from '../../components/home/usersManagement/Logout';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';

class UsersManagementContainer extends Component {
  instructions() {
    const { translate } = this.props;
    const { loggedInUser } = this.props.reducers.loginReducer;

    if (loggedInUser) {
      return (
        <div>
          <div style={{ margin: 15 }}>{translate('currently_logged_in')}</div>
          <div style={{ margin: 15 }}>{translate('to_continue_to_projects')}</div>
          <div style={{ margin: 15 }}>{translate('users.to_log_out')}</div>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ margin: 15 }}>{translate('users.please_log_in', { door43: translate('_.door43') })}</div>
          <div style={{ margin: 15 }}>{translate('users.no_d43_account', { door43: translate('_.door43') })}</div>
          <div style={{ margin: 15 }}>{translate('users.may_create_d43_account')}</div>
        </div>
      );
    }
  }

  render() {
    const { translate } = this.props;
    const userCardManagementCardStyle = {
      width: '100%', height: '100%',
      background: 'white', padding: '20px',
      marginTop: '5px', display: 'flex',
    };
    const { loggedInUser, userdata } = this.props.reducers.loginReducer;
    const { username, email } = userdata || {};
    const { logoutUser, loginUser } = this.props.actions;

    return (
      <HomeContainerContentWrapper instructions={this.instructions()}
        translate={translate}>
        <div style={{ height: '100%', width: '100%' }}>
          {translate('user')}
          <MuiThemeProvider>
            <Card style={{ height: '100%' }}
              containerStyle={userCardManagementCardStyle}>
              {!loggedInUser ?
                <LoginContainer
                  {...this.props}
                  loginUser={(loginCredentials, local) => {
                    loginUser(loginCredentials, local);
                  }}
                />
                :
                <Logout
                  goToNextStep={this.props.actions.goToNextStep}
                  translate={translate}
                  logoutUser={logoutUser}
                  username={username}
                  email={email}
                />
              }
            </Card>
          </MuiThemeProvider>
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  reducers: {
    homeScreenReducer: state.homeScreenReducer,
    loginReducer: state.loginReducer,
  },
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: {
    ...ownProps.actions,
    loginUser: (userDataSumbit, local) => {
      dispatch(LoginActions.loginUser(userDataSumbit, local));
    },
    showPopover: (title, bodyText, positionCoord) => {
      dispatch(PopoverActions.showPopover(title, bodyText, positionCoord));
    },
    logoutUser: () => {
      dispatch(LoginActions.logoutUser());
    },
    showAlert: (message) => {
      dispatch(AlertModalActions.openAlertDialog(message));
    },
    openOptionDialog: (alertMessage, callback, button1Text, button2Text) => {
      dispatch(AlertModalActions.openOptionDialog(alertMessage, callback, button1Text, button2Text));
    },
    closeAlert: () => {
      dispatch(AlertModalActions.closeAlertDialog());
    },
    confirmOnlineAction: (callback) => {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(callback));
    },
  },
});

UsersManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UsersManagementContainer);
