import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import path from "path-extra";
// Components
import StatusBar from "../components/StatusBar";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
// Actions
import * as modalActions from "../actions/ModalActions";
import * as AlertModalActions from "../actions/AlertModalActions";
import * as BodyUIActions from "../actions/BodyUIActions";
import {
  getCurrentToolTitle,
  getIsHomeVisible,
  getProjectName,
  getProjectNickname,
  getUsername
} from "../selectors";

class StatusBarContainer extends React.Component {

  constructor (props) {
    super(props);
    this._onOpen = this._onOpen.bind(this);
  }

  _onOpen () {
    const {
      openModalAndSpecificTab,
      translate
    } = this.props;
    openModalAndSpecificTab(
      translate("login_required", { app: translate("_.app_name") }));
  }

  render () {
    const {
      toolTitle,
      projectName,
      projectNickname,
      username,
      homeIsVisible,
      translate,
      goToStep
    } = this.props;

    return (
      <MuiThemeProvider>
        {homeIsVisible ? null :
          <StatusBar
            goToStep={goToStep}
            translate={translate}
            projectName={projectName}
            projectNickName={projectNickname}
            currentCheckNamespace={toolTitle}
            open={this._onOpen}
            currentUser={username}
          />
        }
      </MuiThemeProvider>
    );
  }
}

/**
 * @description parses project path to extract base name (appropriate to OS)
 * @deprecated
 * @param projectPath
 * @param usePath - optional for testing
 * @return {string} base name
 */
export function getBaseName (projectPath, usePath = path) {
  return usePath.basename(projectPath);
}

StatusBarContainer.propTypes = {
  goToStep: PropTypes.func.isRequired,
  openModalAndSpecificTab: PropTypes.func.isRequired,
  homeIsVisible: PropTypes.bool.isRequired,
  projectName: PropTypes.string.isRequired,
  projectNickname: PropTypes.string.isRequired,
  toolTitle: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    toolTitle: getCurrentToolTitle(state),
    projectName: getProjectName(state),
    projectNickname: getProjectNickname(state),
    username: getUsername(state),
    homeIsVisible: getIsHomeVisible(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    openModalAndSpecificTab: (loggedOutMessage) => {
      return (loggedInUser, tabkey, sectionKey, visible) => {
        if (!loggedInUser) {
          if (tabkey !== 1) {
            dispatch(AlertModalActions.openAlertDialog(loggedOutMessage));
            return;
          }
        }
        dispatch(modalActions.selectModalTab(tabkey, sectionKey, visible));
      };
    },
    goToStep: (stepNumber) => {
      dispatch(BodyUIActions.goToStep(stepNumber));
      // Go to home screen / overview page
      dispatch(BodyUIActions.toggleHomeView(true));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusBarContainer);
