import React from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap/lib';
// components
import Login from '../../components/login/Login';
import Profile from '../../components/login/Profile';
// Actions
import * as LoginActions from '../../actions/LoginActions';
import * as SettingsActions from '../../actions/SettingsActions';
import * as modalActions from '../../actions/ModalActions';
import * as PopoverActions from '../../actions/PopoverActions';
import * as OnlineModeActions from '../../actions/OnlineModeActions';

class ApplicationModalContainer extends React.Component {

  render() {
    let { loggedInUser } = this.props;
    let accountDisplay;
    if (loggedInUser) {
      accountDisplay = <Profile {...this.props} />
    } else {
      accountDisplay = <Login {...this.props} />
    }
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
          bsStyle="pills"
          style={{ borderBottom: "none", backgroundColor: "var(--accent-color)", color: 'var(--text-color)', width: "100%" }}>
          <Tab eventKey={1} title="Account">
            {accountDisplay}
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
    },
    loginLocalUser: (localUsername) => {
      dispatch(LoginActions.loginLocalUser(localUsername));
    },
    goToProjectsTab: () => {
      dispatch(modalActions.selectModalTab(2, 1, true));
    },
    showPopover: (title, bodyText, positionCoord) => {
      dispatch(PopoverActions.showPopover(title, bodyText, positionCoord));
    },
    confirmOnlineAction: (callback) => {
      dispatch(OnlineModeActions.confirmOnlineAction(callback));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationModalContainer);
