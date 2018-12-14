import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';
// actions
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';
//helpers
import * as ResourcesHelpers from '../../helpers/ResourcesHelpers';
import { getSelectedToolName, getTools } from "../../selectors";
import {openTool} from "../../actions/ToolActions";

class ToolsManagementContainer extends Component {
  componentWillMount() {
    const {tools, reducers: {projectDetailsReducer: {projectSaveLocation, manifest: {project = {}}}}} = this.props;
    if (projectSaveLocation && project.id) {
      tools.forEach(({name}) => {
        this.props.actions.loadCurrentCheckCategories(name, project.id, projectSaveLocation);
      });
    }
  }
  render() {
    const {
      tools,
      selectedToolName,
      reducers: {
        loginReducer: { loggedInUser },
        settingsReducer: {
          currentSettings: { developerMode }
        },
        projectDetailsReducer: {
          manifest,
          projectSaveLocation,
          currentProjectToolsProgress,
          currentProjectToolsSelectedGL,
          toolsCategories
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
    const availableCategories = ResourcesHelpers.getAvailableToolCategories(currentProjectToolsSelectedGL, selectedToolName);
    return (
      <HomeContainerContentWrapper
        translate={translate}
        instructions={instructions}
      >
        <div style={{ height: '100%' }}>
          {translate('tools.tools')}
          <ToolsCards
            tools={tools}
            availableCategories={availableCategories}
            toolsCategories={toolsCategories}
            manifest={manifest}
            translate={translate}
            bookName={name}
            loggedInUser={loggedInUser}
            actions={{
              ...this.props.actions,
              launchTool: this.props.actions.launchTool(translate('please_log_in'))
            }}
            developerMode={developerMode}
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
    selectedToolName: getSelectedToolName(state),
    tools: getTools(state),
    reducers: {
      homeScreenReducer: state.homeScreenReducer,
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
      loadCurrentCheckCategories: (toolName, bookName, projectSaveLocation) => {
        dispatch(ProjectDetailsActions.loadCurrentCheckCategories(toolName, bookName, projectSaveLocation));
      },
      getProjectProgressForTools: (toolName) => {
        dispatch(ProjectDetailsActions.getProjectProgressForTools(toolName));
      },
      setProjectToolGL: (toolName, selectedGL) => {
        dispatch(ProjectDetailsActions.setProjectToolGL(toolName, selectedGL));
      },
      launchTool: (loginMessage) => {
        return (toolFolderPath, loggedInUser, toolName) => {
          if (!loggedInUser) {
            dispatch(AlertModalActions.openAlertDialog(loginMessage));
            return;
          }
          dispatch(openTool(toolName));
        };
      },
      updateCheckSelection: (id, value, toolName) => {
        dispatch(ProjectDetailsActions.updateCheckSelection(id, value, toolName));
      }
    }
  };
};

ToolsManagementContainer.propTypes = {
  selectedToolName: PropTypes.string,
  tools: PropTypes.array.isRequired,
  reducers: PropTypes.shape({
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
