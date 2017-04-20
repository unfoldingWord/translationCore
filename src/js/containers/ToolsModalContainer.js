import React from 'react';
import { connect } from 'react-redux';
import * as ToolsActions from '../actions/ToolsActions.js';
import * as modalActions from '../actions/ModalActions.js';
import { Modal, Tabs, Tab } from 'react-bootstrap/lib';
import SwitchCheck from '../components/core/SwitchCheck.js';

class ToolsModalContainer extends React.Component {

  componentWillMount() {
    this.props.getToolsMetadatas();
  }

  render() {
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
              bsStyle="pills"
              style={{borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%"}}>
          <Tab eventKey={1} title="Available Tools" style={{backgroundColor: "#333333"}}>
            <SwitchCheck {...this.props}/>
          </Tab>
          <Tab eventKey={2} title="Online Tools" style={{backgroundColor: "#333333"}}>
          </Tab>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return Object.assign({}, state.toolsReducer, state.settingsReducer, state.projectDetailsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getToolsMetadatas: () => {
      dispatch(ToolsActions.getToolsMetadatas());
    },
    handleLoadTool: (toolFolderPath) => {
      dispatch(ToolsActions.loadTool(toolFolderPath));
    },
    showLoad: () => {
      dispatch(modalActions.selectModalTab(2, 1, true))
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ToolsModalContainer);
