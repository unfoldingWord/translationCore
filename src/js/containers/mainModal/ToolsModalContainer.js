import React from 'react';
import { connect } from 'react-redux';
import { Modal, Tabs, Tab } from 'react-bootstrap/lib';
// components
import SwitchCheck from '../../components/SwitchCheck';
// actions
import * as ToolSelectionActions from '../../actions/ToolSelectionActions';
import * as ToolsMetadataActions from '../../actions/ToolsMetadataActions';
import * as modalActions from '../../actions/ModalActions';
import * as AlertModalActions from '../../actions/AlertModalActions';

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
    ...state.loginReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getToolsMetadatas: () => {
      dispatch(ToolsMetadataActions.getToolsMetadatas());
    },
    handleLoadTool: (toolFolderPath, loggedInUser, currentToolName) => {
      if (!loggedInUser) {
        dispatch(modalActions.selectModalTab(1, 1, true));
        dispatch(AlertModalActions.openAlertDialog("Please login before opening a tool"));
        return;
      }
      dispatch(ToolSelectionActions.selectTool(toolFolderPath, currentToolName));
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
