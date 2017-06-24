import React, { Component } from 'react'
import { connect } from 'react-redux'
import { shell } from 'electron';
import Login from '../../components/home/usersManagement/Login';
import Logout from '../../components/home/usersManagement/Logout';
import LocalUser from '../../components/home/usersManagement/LocalUser';
import * as PopoverActions from '../../actions/PopoverActions';
import * as LoginActions from '../../actions/LoginActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';

class UsersManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localUserView: false
    };
    this.showLocalUserView = this.showLocalUserView.bind(this)
  }

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

  showLocalUserView() {
    this.setState({
      localUserView: !this.state.localUserView
    })
  }

  componentWillMount() {
    let instructions = this.instructions();
    if (this.props.reducers.BodyUIReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    const { loggedInUser } = this.props.reducers.loginReducer;
    const userdata = this.props.reducers.loginReducer.userdata || {};
    const { username, email } = userdata;
    const userCardManagementCardStyle = {
      width: '100%', height: '100%',
      background: 'white', padding: '20px',
      marginTop: '10px', display: 'flex'
    }
    return (
      <div style={{ height: '100%', width: '100%' }}>
        User
      <MuiThemeProvider>
          <Card containerStyle={userCardManagementCardStyle}>
            {!loggedInUser && !this.state.localUserView ?
              <Login {...this.props} showLocalUserView={this.showLocalUserView} /> :
              !loggedInUser && this.state.localUserView ?
                <LocalUser {...this.props} /> :
                <Logout username={username} email={email} {...this.props} />
            }
          </Card>
        </MuiThemeProvider>
      </div>
    );
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      ...ownProps.actions,
      loginUser: (userDataSumbit) => {
        dispatch(LoginActions.loginUser(userDataSumbit));
      },
      loginLocalUser:(username) => {
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
      }
    }
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersManagementContainer);
