import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ToolsCards from "../../components/home/toolsManagement/ToolsCards";
import HomeContainerContentWrapper
  from "../../components/home/HomeContainerContentWrapper";
import * as ProjectDetailsActions from "../../actions/ProjectDetailsActions";
import {
  getTools, getProjectSaveLocation, getProjectBookId, getIsUserLoggedIn
} from "../../selectors";
import { openTool } from "../../actions/ToolActions";
import path from "path-extra";
import ospath from "ospath";
import { getLatestVersionInPath } from "../../helpers/ResourcesHelpers";
import fs from "fs-extra";
import { openAlertDialog } from "../../actions/AlertModalActions";

class ToolsManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.buildCategories = this.buildCategories.bind(this);
    this.handleSelectTool = this.handleSelectTool.bind(this);
    const {tools, reducers} = this.props;
    const projectSaveLocation = getProjectSaveLocation(reducers);
    const bookId = getProjectBookId(reducers);
    if (projectSaveLocation && bookId) {
      tools.forEach(({name}) => {
        this.props.actions.loadCurrentCheckCategories(name, bookId, projectSaveLocation);
      });
    }
  }

  /**
   *
   * @param toolName
   */
  handleSelectTool(toolName) {
    const {isUserLoggedIn, openTool, translate, openAlertDialog} = this.props;
    if(isUserLoggedIn) {
      openTool(toolName);
    } else {
      openAlertDialog(translate("please_log_in"));
    }
  }

  /**
   * TODO: move this into {@link ToolsCards}
   */
  buildCategories(currentProjectToolsSelectedGL) {
    const availableCategories = {};
    Object.keys(currentProjectToolsSelectedGL).forEach((toolName) => {
      const gatewayLanguage = currentProjectToolsSelectedGL[toolName] || 'en';
      const toolResourceDirectory = path.join(ospath.home(), 'translationCore', 'resources', gatewayLanguage, 'translationHelps', toolName);
      const versionDirectory = getLatestVersionInPath(toolResourceDirectory) || toolResourceDirectory;
      if (fs.existsSync(versionDirectory))
        availableCategories[toolName] = fs.readdirSync(versionDirectory).filter((dirName)=>
          fs.lstatSync(path.join(versionDirectory, dirName)).isDirectory()
        );
        if (availableCategories[toolName] && availableCategories[toolName].indexOf('other') === availableCategories[toolName].length - 1) {
         var otherCat = availableCategories[toolName].splice(availableCategories[toolName].length - 1, availableCategories[toolName].length );
         availableCategories[toolName].splice(1, 0, ...otherCat);
        }
      else availableCategories[toolName] = [];
    });
    return availableCategories;
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
          manifest,
          projectSaveLocation,
          currentProjectToolsProgress,
          currentProjectToolsSelectedGL,
          toolsCategories
        },
        invalidatedReducer
      },
      translate
    } = this.props;
    const instructions = (
      <div>
        <p>{translate("tools.select_tool_from_list")}</p>
        <p>{translate("projects.books_available",
          { app: translate("_.app_name") })}</p>
      </div>
    );
    const availableCategories = this.buildCategories(currentProjectToolsSelectedGL);
    return (
      <HomeContainerContentWrapper
        translate={translate}
        instructions={instructions}
      >
        <div style={{ height: "100%" }}>
          {translate("tools.tools")}
          <ToolsCards
            tools={tools}
            onSelectTool={this.handleSelectTool}
            availableCategories={availableCategories}
            toolsCategories={toolsCategories}
            manifest={manifest}
            translate={translate}
            bookName={name}
            loggedInUser={loggedInUser}
            actions={{
              ...this.props.actions
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
    isUserLoggedIn: getIsUserLoggedIn(state),
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
    openTool: name => dispatch(openTool(name)),
    openAlertDialog: message => dispatch(openAlertDialog(message)),
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
      updateCheckSelection: (id, value, toolName) => {
        dispatch(
          ProjectDetailsActions.updateCheckSelection(id, value, toolName));
      }
    }
  };
};

ToolsManagementContainer.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  openTool: PropTypes.func.isRequired,
  openAlertDialog: PropTypes.func.isRequired,
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
