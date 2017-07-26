import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
    const {
      currentSettings: {
        developerMode
      }
    } = this.props.reducers.settingsReducer;
    const {
      bookName,
      projectSaveLocation,
      currentProjectToolsProgress
    } = this.props.reducers.projectDetailsReducer;

    return (
      <div style={{ height: '100%' }}>
        ToolsManagementContainer
        <ToolsCards
          bookName={bookName}
          loggedInUser={loggedInUser}
          actions={this.props.actions}
          developerMode={developerMode}
          toolsMetadata={toolsMetadata}
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

ToolsManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer)
