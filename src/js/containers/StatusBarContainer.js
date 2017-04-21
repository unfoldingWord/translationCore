import React from 'react';
import { connect  } from 'react-redux';
// Components
import StatusBar from '../components/core/SideBar/StatusBar.js';
// Actions
import * as modalActions from '../actions/ModalActions.js';
import * as coreStoreActions from '../actions/CoreActionsRedux.js';


class StatusBarContainer extends React.Component {

  render() {
    let { bookName } = this.props.projectDetailsReducer;
    let { toolName } = this.props.currentToolReducer;
    let { username } = this.props.loginReducer.userdata;

    return (
      <div>
        <StatusBar
          bookName={bookName}
          currentCheckNamespace={toolName}
          open={this.props.openModalAndSpecificTab}
          online={this.props.online}
          changeOnlineStatus={this.props.changeOnlineStatus}
          currentUser={username}
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
    loginReducer: state.loginReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    openModalAndSpecificTab: (tabkey, sectionKey, visible) => {
      dispatch(modalActions.selectModalTab(tabkey, sectionKey, visible));
    },
    changeOnlineStatus: val => {
      dispatch(coreStoreActions.changeOnlineStatus(val));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusBarContainer);
