import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';
// actions
import * as ToolSelectionActions from '../../actions/ToolSelectionActions';
import * as ToolsMetadataActions from '../../actions/ToolsMetadataActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';

class ToolsManagementContainer extends Component {

  componentWillMount() {
    //this.props.actions.getToolsMetadatas();
  }

  render() {
    const {
      reducers: {
        toolsReducer: { toolsMetadata },
        loginReducer: { loggedInUser },
        settingsReducer: {
          currentSettings: { developerMode }
        },
        projectDetailsReducer: {
          availableCategories,
          selectedCategories,
          manifest,
          projectSaveLocation,
          currentProjectToolsProgress,
          currentProjectToolsSelectedGL
        },
        invalidatedReducer,
      },
      translate
    } = this.props;
    const instructions = (
      <div>
        <p>{translate('tools.select_tool_from_list')}</p>
        <p>{translate('projects.books_available', {app: translate('_.app_name')})}</p>
      </div>
    );

    return (
      <HomeContainerContentWrapper
        translate={translate}
        instructions={instructions}
      >
        <div style={{ height: '100%' }}>
          {translate('tools.tools')}
          <ToolsCards
            availableCategories={availableCategories}
            selectedCategories={selectedCategories}
            manifest={manifest}
            translate={translate}
            bookName={name}
            loggedInUser={loggedInUser}
            actions={{
              ...this.props.actions,
              launchTool: this.props.actions.launchTool(translate('please_log_in'))
            }}
            developerMode={developerMode}
            toolsMetadata={toolsMetadata}
            invalidatedReducer={invalidatedReducer}
            projectSaveLocation={projectSaveLocation}
            currentProjectToolsProgress={currentProjectToolsProgress}
            currentProjectToolsSelectedGL={currentProjectToolsSelectedGL}
          />
        </div>
      </HomeContainerContentWrapper>
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
      loginReducer: state.loginReducer,
      invalidatedReducer: state.invalidatedReducer
    }
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      getToolsMetadatas: () => {
        dispatch(ToolsMetadataActions.getToolsMetadatas());
      },
      getProjectProgressForTools: (toolName) => {
        dispatch(ProjectDetailsActions.getProjectProgressForTools(toolName));
      },
      setProjectToolGL: (toolName, selectedGL) => {
        dispatch(ProjectDetailsActions.setProjectToolGL(toolName, selectedGL));
      },
      launchTool: (loginMessage) => {
        return (toolFolderPath, loggedInUser, currentToolName) => {
          if (!loggedInUser) {
            dispatch(AlertModalActions.openAlertDialog(loginMessage));
            return;
          }
          dispatch(ToolSelectionActions.selectTool(toolFolderPath, currentToolName));
        };
      },
      updateCheckSelection: (id, value) => {
        dispatch(ProjectDetailsActions.updateCheckSelection(id, value));
      }
    }
  };
};

ToolsManagementContainer.propTypes = {
  reducers: PropTypes.shape({
    toolsReducer: PropTypes.shape({
      toolsMetadata: PropTypes.array
    }).isRequired,
    settingsReducer: PropTypes.shape({
      currentSettings: PropTypes.shape({
        developerMode: PropTypes.bool
      }).isRequired
    }).isRequired,
    projectDetailsReducer: PropTypes.object.isRequired,
    loginReducer: PropTypes.shape({
      loggedInUser: PropTypes.bool
    }).isRequired
  }).isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer);
