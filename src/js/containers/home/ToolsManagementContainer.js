import React, { Component } from 'react';
import { connect } from 'react-redux'
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards'
// actions
import * as ToolSelectionActions from '../../actions/ToolSelectionActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as ToolsMetadataActions from '../../actions/ToolsMetadataActions';
import * as AlertModalActions from '../../actions/AlertModalActions';

class ToolsManagementContainer extends Component {

  componentWillMount() {
    this.props.actions.getToolsMetadatas();
    // get instructions
    let instructions = <div>ToolsManagementInstructions</div>;
    if (this.props.reducers.homeScreenReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    return (
      <div>
        ToolsManagementContainer
        <ToolsCards {...this.props}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    reducers: {
      homeScreenReducer: state.homeScreenReducer,
      toolsReducer: state.toolsReducer,
      settingsReducer: state.settingsReducer,
      projectDetailsReducer: state.projectDetailsReducer,
      loginReducer: state.loginReducer
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      getToolsMetadatas: () => {
        dispatch(ToolsMetadataActions.getToolsMetadatas());
      },
      handleSelectTool: (toolFolderPath, loggedInUser, currentToolName) => {
        if (!loggedInUser) {
          //dispatch(modalActions.selectModalTab(1, 1, true));
          dispatch(AlertModalActions.openAlertDialog("Please login before opening a tool"));
          return;
        }
        dispatch(ToolSelectionActions.selectTool(toolFolderPath, currentToolName));
      },
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer)
