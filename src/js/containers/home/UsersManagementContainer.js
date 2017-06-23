import React, { Component } from 'react'
import { connect } from 'react-redux'
import { shell } from 'electron';
import Login from '../../components/home/usersManagement/Login';
import Logout from '../../components/home/usersManagement/Logout';
import * as PopoverActions from '../../actions/PopoverActions';
import * as LoginActions from '../../actions/LoginActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';

class UsersManagementContainer extends Component {
  instructions() {
    return (
      <div>
        <div style={{ margin: 15 }}>Please login with you Door43 Account</div>
        <div style={{ margin: 15 }}>If you do not have an account already, you may create an account.</div>
        <div style={{ margin: 15 }}>If you would rather work offline, you may select continue offline.</div>
      </div>
    )
  }
  handleLoginSubmit() {
    this.props.loginUser();
  }

  componentWillMount() {
    let instructions = this.instructions();
    if (this.props.reducers.BodyUIReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    const { loggedInUser } = this.props.loginReducer;
    const userdata = this.props.loginReducer.userdata || {};
    const { username, email } = userdata;
    return (
      <div style={{ height: '100%', width: '100%' }}>
        User
      <MuiThemeProvider>
          <Card style={{
            width: '100%', height: '100%', background: 'white', padding: '20px', marginTop: '10px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              {!loggedInUser ?
                <Login {...this.props} /> :
                <Logout username={username} email={email} {...this.props} />
              }
            </div>
          </Card>
        </MuiThemeProvider>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    loginReducer: state.loginReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loginUser: (userDataSumbit) => {
      dispatch(LoginActions.loginUser(userDataSumbit));
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
    openDoor43AccountWindow: ()=> {
      shell.openExternal('https://git.door43.org/user/sign_up')
    },
    showLocalUserView: () => {
      dispatch(LoginActions.)
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersManagementContainer);
