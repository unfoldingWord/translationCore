import React from 'react';
import { connect } from 'react-redux';
// Components
import StatusBar from '../components/StatusBar';
// Actions
import * as modalActions from '../actions/ModalActions';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as coreStoreActions from '../actions/CoreActionsRedux';
import * as BodyUIActions from '../actions/BodyUIActions';

class StatusBarContainer extends React.Component {

  componentWillMount() {
    let online = window.navigator.onLine;
    this.props.actions.changeOnlineStatus(online, true);
  }

  render() {
    const { displayHomeView } = this.props.homeScreenReducer;
    let projectName = this.props.projectDetailsReducer.projectSaveLocation.split("/").pop();
    //Expecting a folder path as such: "~/project_name"
    let { currentToolTitle } = this.props.toolsReducer;
    let { username } = this.props.loginReducer.userdata;
    let { loggedInUser } = this.props.loginReducer;

    return (
      <div>
      {displayHomeView ? null :
        <StatusBar
          {...this.props}
          toggleHomeScreen={this.props.actions.toggleHomeScreen}
          projectName={projectName}
          currentCheckNamespace={currentToolTitle}
          open={this.props.actions.openModalAndSpecificTab}
          online={this.props.online}
          changeOnlineStatus={this.props.actions.changeOnlineStatus}
          currentUser={username}
          loggedInUser={loggedInUser}
        />
      }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    settingsReducer: state.settingsReducer,
    toolsReducer: state.toolsReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    loginReducer: state.loginReducer,
    homeScreenReducer: state.homeScreenReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      openModalAndSpecificTab: (loggedInUser, tabkey, sectionKey, visible) => {
        if (!loggedInUser) {
          if (tabkey !== 1) {
            dispatch(AlertModalActions.openAlertDialog("You must be logged in to use translationCore"));
            return;
          }
        }
        dispatch(modalActions.selectModalTab(tabkey, sectionKey, visible));
      },
      changeOnlineStatus: (val, first) => {
        dispatch(coreStoreActions.changeOnlineStatus(val, first));
      },
      goToStep: (stepNumber) => {
        dispatch(BodyUIActions.goToStep(stepNumber));
         // Go to home screen / overview page
        dispatch(BodyUIActions.toggleHomeView(true));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusBarContainer);
