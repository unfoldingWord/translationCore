import React, { Component } from 'react';
import { connect } from 'react-redux'
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards'
// actions
import * as ToolSelectionActions from '../../actions/ToolSelectionActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as ToolsMetadataActions from '../../actions/ToolsMetadataActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';

class ToolsManagementContainer extends Component {

  componentWillMount() {
    this.props.actions.getToolsMetadatas();
    // get instructions
    let instructions = <div>Select a tool from the list</div>;
    if (this.props.reducers.homeScreenReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    const { toolsMetadata } = this.props.reducers.toolsReducer;
    const { loggedInUser } = this.props.reducers.loginReducer;
    const { bookName, projectSaveLocation, currentProjectToolsProgress } = this.props.reducers.projectDetailsReducer;

    return (
      <div style={{ height: '100%' }}>
        ToolsManagementContainer
        <ToolsCards
          actions={this.props.actions}
          toolsMetadata={toolsMetadata}
          bookName={bookName}
          loggedInUser={loggedInUser}
          projectSaveLocation={projectSaveLocation}
          currentProjectToolsProgress={currentProjectToolsProgress}
        />
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
      getProjectProgressForTools: (toolsMetadata) => {
        dispatch(ProjectDetailsActions.getProjectProgressForTools(toolsMetadata));
      },
      launchTool: (toolFolderPath, loggedInUser, currentToolName) => {
        if (!loggedInUser) {
          //dispatch(modalActions.selectModalTab(1, 1, true));
          dispatch(AlertModalActions.openAlertDialog("Please login before opening a tool"));
          return;
        }
        dispatch(ToolSelectionActions.selectTool(toolFolderPath, currentToolName));
      },
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      },
      goToStep: (stepNumber) => {
        dispatch(BodyUIActions.goToStep(stepNumber));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer)
