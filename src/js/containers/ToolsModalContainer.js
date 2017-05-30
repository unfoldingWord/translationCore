import React from 'react';
import { connect } from 'react-redux';
import { Modal, Tabs, Tab } from 'react-bootstrap/lib';
// components
import SwitchCheck from '../components/core/SwitchCheck.js';
// actions
import * as ToolsActions from '../actions/ToolsActions.js';
import * as modalActions from '../actions/ModalActions.js';
import * as AlertModalActions from '../actions/AlertModalActions.js';

class ToolsModalContainer extends React.Component {

  componentWillMount() {
    this.props.getToolsMetadatas();
  }

  render() {
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
              bsStyle="pills"
              style={{borderBottom: "none", backgroundColor: "var(--accent-color)", color: 'var(--text-color)', width: "100%"}}>
          <Tab eventKey={1} title="Available Tools">
            <SwitchCheck {...this.props}/>
          </Tab>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    ...state.toolsReducer,
    ...state.settingsReducer,
    ...state.projectDetailsReducer,
    ...state.loginReducer,
    ...state.currentToolReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getToolsMetadatas: () => {
      dispatch(ToolsActions.getToolsMetadatas());
    },
    handleLoadTool: (toolFolderPath, loggedInUser, toolName) => {
      if (!loggedInUser) {
        dispatch(modalActions.selectModalTab(1, 1, true));
        dispatch(AlertModalActions.openAlertDialog("Please login before opening a tool"));
        return;
      }
      dispatch(ToolsActions.loadTool(toolFolderPath, toolName));
    },
    showLoad: () => {
      dispatch(modalActions.selectModalTab(2, 1, true))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsModalContainer);
