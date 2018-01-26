import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
// Components
import StatusBar from '../components/StatusBar';
import {withLocale} from '../components/Locale';
// Actions
import * as modalActions from '../actions/ModalActions';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as BodyUIActions from '../actions/BodyUIActions';

class StatusBarContainer extends React.Component {
  render() {
    const { displayHomeView } = this.props.homeScreenReducer;
    let projectName = getBaseName(this.props.projectDetailsReducer.projectSaveLocation);
    let { currentToolTitle } = this.props.toolsReducer;
    let { username } = this.props.loginReducer.userdata;
    let { loggedInUser } = this.props.loginReducer;
    const {toggleHomeScreen, openModalAndSpecificTab} = this.props.actions;

    const {translate, online} = this.props;

    return (
      <div>
      {displayHomeView ? null :
        <StatusBar
          {...this.props}
          toggleHomeScreen={toggleHomeScreen}
          projectName={projectName}
          currentCheckNamespace={currentToolTitle}
          open={openModalAndSpecificTab(translate('login_required'))}
          online={online}
          currentUser={username}
          loggedInUser={loggedInUser}
        />
      }
      </div>
    );
  }
}

/**
 * @description parses project path to extract base name (appropriate to OS)
 * @param projectPath
 * @param usePath - optional for testing
 * @return {string} base name
 */
export function getBaseName(projectPath, usePath=path) {
  return usePath.basename(projectPath);
}

StatusBarContainer.propTypes = {
  actions: PropTypes.any.isRequired,
  homeScreenReducer: PropTypes.any.isRequired,
  projectDetailsReducer: PropTypes.any.isRequired,
  toolsReducer: PropTypes.any.isRequired,
  loginReducer: PropTypes.any.isRequired,
  online: PropTypes.any,
  translate: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    settingsReducer: state.settingsReducer,
    toolsReducer: state.toolsReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    loginReducer: state.loginReducer,
    homeScreenReducer: state.homeScreenReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
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
    }
  };
};

export default withLocale(connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusBarContainer));
