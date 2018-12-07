import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ToolsCards from '../../components/home/toolsManagement/ToolsCards';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';
import {
  getSelectedToolName,
  getToolGatewayLanguage,
  getTools
} from "../../selectors";
import {openTool} from "../../actions/ToolActions";
import path from "path-extra";
import ospath from "ospath";
import { getLatestVersionInPath } from "../../helpers/ResourcesHelpers";
import fs from "fs-extra";

class ToolsManagementContainer extends Component {

  constructor(props) {
    super(props);
    this.buildCategories = this.buildCategories.bind(this);
  }

  componentDidMount() {
    // TODO: move the tool connecting into {@link ToolsCards}
    // TODO: connect tools here
  }

  /**
   * TODO: move this into {@link ToolsCards}
   */
  buildCategories() {
    const {tools} = this.props;
    const categories = {};
    for(let t of tools) {
      const language = getToolGatewayLanguage(t.name);
      const resourceDir = path.join(ospath.home(), 'translationCore', 'resources', language, 'translationHelps', t.name);
      const versionDir = getLatestVersionInPath(resourceDir) || resourceDir;

      if (fs.existsSync(versionDir)) {
        categories[t.name] = fs.readdirSync(versionDir).
          filter((dirName) =>
            fs.lstatSync(path.join(versionDir, dirName)).isDirectory()
          );
      } else {
        categories[t.name] = [];
      }
    }
    return categories;
  }

  render() {
    const {
      tools,
      reducers: {
        loginReducer: { loggedInUser },
        settingsReducer: {
          currentSettings: { developerMode }
        },
        projectDetailsReducer: {
          selectedCategories,
          manifest,
          projectSaveLocation,
          currentProjectToolsProgress
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
    const availableCategories = this.buildCategories();
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
            invalidatedReducer={invalidatedReducer}
            projectSaveLocation={projectSaveLocation}
            currentProjectToolsProgress={currentProjectToolsProgress}
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
