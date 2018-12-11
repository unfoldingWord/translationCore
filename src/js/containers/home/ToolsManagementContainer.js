import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ToolsCards from "../../components/home/toolsManagement/ToolsCards";
import HomeContainerContentWrapper
  from "../../components/home/HomeContainerContentWrapper";
import * as AlertModalActions from "../../actions/AlertModalActions";
import * as ProjectDetailsActions from "../../actions/ProjectDetailsActions";
import {
  getIsUserLoggedIn,
  getProjectSaveLocation, getSetting,
  getToolGatewayLanguage,
  getTools
} from "../../selectors";
import { openTool } from "../../actions/ToolActions";
import path from "path-extra";
import ospath from "ospath";
import { getLatestVersionInPath } from "../../helpers/ResourcesHelpers";
import fs from "fs-extra";
import { openAlertDialog } from "../../actions/AlertModalActions";
import { goToStep } from "../../actions/BodyUIActions";

class ToolsManagementContainer extends Component {

  constructor(props) {
    super(props);
    this.buildCategories = this.buildCategories.bind(this);
    this.handleSelectTool = this.handleSelectTool.bind(this);
  }

  buildCategories() {
    const { tools } = this.props;
    const categories = {};
    for (let t of tools) {
      const language = getToolGatewayLanguage(t.name);
      const resourceDir = path.join(ospath.home(), "translationCore",
        "resources", language, "translationHelps", t.name);
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

  handleGoBack() {
    const {goToStep} = this.props;
    goToStep(2);
  }

  handleSelectTool(toolName) {
    const {isUserLoggedIn, openTool, translate, openAlertDialog} = this.props;
    if(isUserLoggedIn) {
      openTool(toolName);
    } else {
      openAlertDialog(translate("please_log_in"));
    }
  }

  render() {
    const {
      tools,
      projectPath,
      selectedCategories,
      translate
    } = this.props;
    const instructions = (
      <div>
        <p>{translate("tools.select_tool_from_list")}</p>
        <p>{translate("projects.books_available",
          { app: translate("_.app_name") })}</p>
      </div>
    );
    const availableCategories = this.buildCategories();
    return (
      <HomeContainerContentWrapper
        translate={translate}
        instructions={instructions}
      >
        <div style={{ height: "100%" }}>
          {translate("tools.tools")}
          <ToolsCards
            tools={tools}
            onGoBack={this.handleGoBack}
            onSelectTool={this.handleSelectTool}
            availableCategories={availableCategories}
            selectedCategories={selectedCategories}
            translate={translate}
            bookName={name}
            actions={{
              ...this.props.actions
            }}
            projectPath={projectPath}
          />
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isUserLoggedIn: getIsUserLoggedIn(state),
    projectPath: getProjectSaveLocation(state),
    tools: getTools(state),
    selectedCategories: getSetting(state, 'selectedCategories')
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    openTool: name => dispatch(openTool(name)),
    openAlertDialog: message => dispatch(openAlertDialog(message)),
    goToStep: step => dispatch(goToStep(step)),

    actions: {
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
  goToStep: PropTypes.func.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
  openTool: PropTypes.func.isRequired,
  openAlertDialog: PropTypes.func.isRequired,
  tools: PropTypes.array.isRequired,
  projectPath: PropTypes.string.isRequired,
  selectedCategories: PropTypes.any.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer);
