import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// actions
import * as PopoverActions from '../../actions/PopoverActions';
import * as LoginActions from '../../actions/LoginActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
import LoginContainer from '../../components/home/usersManagement';
import Logout from '../../components/home/usersManagement/Logout';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';

class UsersManagementContainer extends Component {

  componentWillMount() {
    if (this.props.reducers.loginReducer.userdata.username) {
      this.props.actions.updateStepLabel(1, this.props.reducers.loginReducer.userdata.username);
    }
  }

  instructions() {
    const {translate} = this.props;
    const { loggedInUser } = this.props.reducers.loginReducer;
    if (loggedInUser) {
      return (
        <div>
          <div style={{ margin: 15 }}>{translate('home.users.logged_in')}</div>
          <div style={{ margin: 15 }}>{translate('home.users.to_continue_to_projects')}</div>
          <div style={{ margin: 15 }}>{translate('home.users.to_logout')}</div>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ margin: 15 }}>{translate('home.users.logged_out')}</div>
          <div style={{ margin: 15 }}>{translate('home.users.create_door43_account')}</div>
          <div style={{ margin: 15 }}>{translate('home.users.continue_as_guest')}</div>
        </div>
      );
    }
  }

  render() {
    const {translate} = this.props;
    const userCardManagementCardStyle = {
      width: '100%', height: '100%',
      background: 'white', padding: '20px',
      marginTop: '5px', display: 'flex'
    };
    const { loggedInUser, userdata } = this.props.reducers.loginReducer;
    const { username, email } = userdata || {};
    const { logoutUser, loginUser, updateStepLabel} = this.props.actions;

    return (
      <HomeContainerContentWrapper instructions={this.instructions()}
                                   translate={translate}>
        <div style={{ height: '100%', width: '100%' }}>
          User
          <MuiThemeProvider>
            <Card style={{ height: '100%' }}
                  containerStyle={userCardManagementCardStyle}>
              {!loggedInUser ?
                <LoginContainer
                  {...this.props}
                  loginUser={(loginCredentials, local) => {
                    loginUser(loginCredentials, local);
                    updateStepLabel(1, loginCredentials.username);
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

const mapStateToProps = (state,) => {
  return {
    reducers: {
      homeScreenReducer: state.homeScreenReducer,
      loginReducer: state.loginReducer
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
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
      updateStepLabel: (index, label) => {
        dispatch(BodyUIActions.updateStepLabel(index, label));
      }
    }
  };
};

UsersManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersManagementContainer);
