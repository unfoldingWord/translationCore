import React from 'react';
import { connect  } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap/lib';
// components
import Login from '../components/core/login/Login.js';
import Profile from '../components/core/login/Profile';
import Licenses from '../components/core/licenses/Licenses.js'
// Actions
import * as LoginActions from '../actions/LoginActions.js';
import * as SettingsActions from '../actions/SettingsActions.js';

class ApplicationModalContainer extends React.Component {

  render() {
    let { loggedInUser } = this.props;
    let accountDisplay;
    if (loggedInUser){
      accountDisplay = <Profile {...this.props}/>
    } else {
      accountDisplay = <Login {...this.props}/>
    }
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
              bsStyle="pills"
              style={{borderBottom: "none", backgroundColor: "#ffffff", color: '#333333', width: "100%"}}>
          <Tab eventKey={1} title="Account">
              {accountDisplay}
          </Tab>
          <Tab eventKey={2} title="Licenses" style={{backgroundColor: "#ffffff"}}>
              <Licenses />
          </Tab>
        </Tabs>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    ...state.loginReducer,
    ...state.settingsReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onHandleUserName: (e) => {
      dispatch(LoginActions.setUserName(e.target.value));
    },
    onHandlePassword: (e) => {
      dispatch(LoginActions.setUserPassword(e.target.value));
    },
    onSwitchToLoginPage: (displayLoginBool) => {
      dispatch(LoginActions.displayLogin(displayLoginBool));
    },
    handleSubmit: (userDataSumbit) => {
      dispatch(LoginActions.loginUser(userDataSumbit));
    },
    onHandleLogout: () => {
      dispatch(LoginActions.logoutUser());
    },
    onSettingsChange: (field, value) => {
      dispatch(SettingsActions.setSettings(field, value));
    },
    feedbackChange: (e) => {
      dispatch(LoginActions.feedbackChange(e.target.value));
    },
    subjectChange: (e) => {
      dispatch(LoginActions.subjectChange(e.target.value));
    },
    submitFeedback: () => {
      dispatch(LoginActions.submitFeedback());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationModalContainer);
