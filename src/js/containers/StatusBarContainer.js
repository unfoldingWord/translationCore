import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
// Components
import StatusBar from '../components/StatusBar';
// Actions
import * as BodyUIActions from '../actions/BodyUIActions';
import {
  getSelectedToolTitle,
  getIsHomeVisible,
  getProjectName,
  getProjectNickname,
  getUsername,
} from '../selectors';

class StatusBarContainer extends React.Component {
  constructor(props) {
    super(props);
    this._HandleGoToStep = this._HandleGoToStep.bind(this);
  }

  _HandleGoToStep(stepNumber) {
    const {
      goToStep,
      toggleHomeView,
    } = this.props;
    goToStep(stepNumber);
    toggleHomeView(true);
  }

  render() {
    const {
      toolTitle,
      projectName,
      projectNickname,
      username,
      homeIsVisible,
      translate,
    } = this.props;

    return (
      <div>
        {homeIsVisible ? null :
          <StatusBar
            goToStep={this._HandleGoToStep}
            translate={translate}
            projectName={projectName}
            projectNickName={projectNickname}
            currentCheckNamespace={toolTitle}
            currentUser={username}
          />
        }
      </div>
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
export function getBaseName(projectPath, usePath = path) {
  return usePath.basename(projectPath);
}

StatusBarContainer.propTypes = {
  goToStep: PropTypes.func.isRequired,
  toggleHomeView: PropTypes.func.isRequired,
  homeIsVisible: PropTypes.bool.isRequired,
  projectName: PropTypes.string.isRequired,
  projectNickname: PropTypes.string.isRequired,
  toolTitle: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  toolTitle: getSelectedToolTitle(state),
  projectName: getProjectName(state),
  projectNickname: getProjectNickname(state),
  username: getUsername(state),
  homeIsVisible: getIsHomeVisible(state),
});

const mapDispatchToProps = {
  goToStep: BodyUIActions.goToStep,
  toggleHomeView: BodyUIActions.toggleHomeView,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatusBarContainer);
