import React from 'react';
import { connect  } from 'react-redux';
// Components
import StatusBar from '../components/SideBar/StatusBar.js';
// Actions
import * as modalActions from '../actions/ModalActions.js';
import { openAlertDialog } from '../actions/AlertModalActions.js';
import * as coreStoreActions from '../actions/CoreActionsRedux.js';


class StatusBarContainer extends React.Component {

  componentWillMount() {
    let online = window.navigator.onLine;
    this.props.changeOnlineStatus(online, true);
  }

  render() {
    let projectName = this.props.projectDetailsReducer.projectSaveLocation.split("/").pop();
    //Expecting a folder path as such: "~/project_name"
    let { toolTitle } = this.props.currentToolReducer;
    let { username } = this.props.loginReducer.userdata;
    let { loggedInUser } = this.props.loginReducer;

    return (
      <div>
        <StatusBar
          {...this.props}
          projectName={projectName}
          currentCheckNamespace={toolTitle}
          open={this.props.openModalAndSpecificTab}
          online={this.props.online}
          changeOnlineStatus={this.props.changeOnlineStatus}
          currentUser={username}
          loggedInUser={loggedInUser}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    statusBarReducer: state.statusBarReducer,
    currentToolReducer: state.currentToolReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    loginReducer: state.loginReducer,
    BodyUIReducer: state.BodyUIReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    openModalAndSpecificTab: (loggedInUser, tabkey, sectionKey, visible) => {
      if (!loggedInUser) {
        if (tabkey !== 1) {
          dispatch(openAlertDialog("You must be logged in to use translationCore"));
          return;
        }
      }
      dispatch(modalActions.selectModalTab(tabkey, sectionKey, visible));
    },
    changeOnlineStatus: (val, first) => {
      dispatch(coreStoreActions.changeOnlineStatus(val, first));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusBarContainer);
