import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// actions
import * as PopoverActions from '../../actions/PopoverActions';
import * as LoginActions from '../../actions/LoginActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as OnlineModeActions from '../../actions/OnlineModeActions';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
import LoginContainer from '../../components/home/usersManagement';
import Logout from '../../components/home/usersManagement/Logout';

class UsersManagementContainer extends Component {

  componentWillMount() {
    let instructions = this.instructions();
    if (this.props.reducers.homeScreenReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  showLoggedInInstructions() {
    let instructions = (
      <div>
        <div style={{ margin: 15 }}>You are currently logged in.</div>
        <div style={{ margin: 15 }}>To continue to Projects, click "Continue to Project"</div>
        <div style={{ margin: 15 }}>To log out, click "Log out"</div>
      </div>
    );
    this.props.actions.changeHomeInstructions(instructions);
  }

  showLoggedOutInstructions() {
    let instructions = (
      <div>
        <div style={{ margin: 15 }}>Please login with your Door43 Account</div>
        <div style={{ margin: 15 }}>If you do not have an account already, you may create an account.</div>
        <div style={{ margin: 15 }}>If you would rather work offline, you may select create a local account.</div>
      </div>
    );
    this.props.actions.changeHomeInstructions(instructions);
  }

  instructions() {
    const { loggedInUser } = this.props.reducers.loginReducer;
    if (loggedInUser) {
      return (
        <div>
          <div style={{ margin: 15 }}>You are currently logged in.</div>
          <div style={{ margin: 15 }}>To continue to Projects, click "Continue to Project"</div>
          <div style={{ margin: 15 }}>To log out, click "Log out"</div>
        </div>
      )
    } else {
      return (
        <div>
          <div style={{ margin: 15 }}>Please login with your Door43 Account</div>
          <div style={{ margin: 15 }}>If you do not have an account already, you may create an account.</div>
          <div style={{ margin: 15 }}>If you would rather work offline, you may select create a local account.</div>
        </div>
      )
    }
  }

  render() {
    const userCardManagementCardStyle = {
      width: '100%', height: '100%',
      background: 'white', padding: '20px',
      marginTop: '5px', display: 'flex'
    }
    const { loggedInUser, userdata } = this.props.reducers.loginReducer;
    const { username, email } = userdata || {};

    return (
      <div style={{ height: '100%', width: '100%' }}>
        User
      <MuiThemeProvider>
          <Card style={{ height: '100%' }} containerStyle={userCardManagementCardStyle}>
            {!loggedInUser ?
              <LoginContainer
                {...this.props}
                loginUser={(loginCredentials) => {
                  this.props.actions.loginUser(loginCredentials);
                  this.showLoggedInInstructions();
                }}
                loginLocalUser={(localUsername) => {
                  this.props.actions.loginLocalUser(localUsername);
                  this.showLoggedInInstructions();
                }}
              />
              :
              <Logout
                {...this.props}
                logoutUser={() => {
                  this.props.actions.logoutUser();
                  this.showLoggedOutInstructions();
                }}
                username={username}
                email={email}
              />
            }
          </Card>
        </MuiThemeProvider>
      </div>
    );
  }
}

const mapStateToProps = (state,) => {
  return {
    reducers: {
      homeScreenReducer: state.homeScreenReducer,
      loginReducer: state.loginReducer
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      ...ownProps.actions,
      loginUser: (userDataSumbit) => {
        dispatch(LoginActions.loginUser(userDataSumbit));
      },
      loginLocalUser: (username) => {
        dispatch(LoginActions.loginLocalUser(username))
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
      goToNextStep: () => {
        dispatch(BodyUIActions.goToNextStep());
      },
      openOptionDialog: (alertMessage, callback, button1Text, button2Text) => {
        dispatch(AlertModalActions.openOptionDialog(alertMessage, callback, button1Text, button2Text));
      },
      closeAlert: () => {
        dispatch(AlertModalActions.closeAlertDialog());
      },
      confirmOnlineAction: (callback) => {
        dispatch(OnlineModeActions.confirmOnlineAction(callback));
      },
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      }
    }
  }
};

UsersManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersManagementContainer);
