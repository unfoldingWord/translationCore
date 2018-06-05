import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
import { Stepper } from 'material-ui/Stepper';
import * as bodyUIHelpers from '../../../helpers/bodyUIHelpers';
import {goToStep} from '../../../actions/BodyUIActions';
import AppMenu from '../../../containers/AppMenu';
import HomeStep from './HomeStep';
import {
  getIsUserLoggedIn,
  getUsername,
  getProjectSaveLocation,
  getHomeScreenStep,
  getActiveHomeScreenSteps,
  getProjectNickname
} from '../../../selectors';
import path from 'path-extra';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
  const projectSaveLocation = getProjectSaveLocation(state);
  return {
    isUserLoggedIn: getIsUserLoggedIn(state),
    username: getUsername(state),
    isProjectLoaded: !!projectSaveLocation,
    projectName: path.parse(projectSaveLocation).base,
    stepIndex: getHomeScreenStep(state),
    activeSteps: getActiveHomeScreenSteps(state),
    projectNickname: getProjectNickname(state)
  };
};

const mapDispatchToProps = {
  goToStep
};

/**
 * determine what to display for project label and for hover text.  First if there is no project nickname, the project
 *  name is used, else uses "Project: <nick_name>" for project label.  Next if project label is shorter than maximum
 *  length, then full label is displayed and hover text is empty.  Otherwise truncated project label is displayed and
 *  full project label is shown as hover text.
 * @param isProjectLoaded
 * @param projectName
 * @param translate
 * @param projectNickname
 * @param project_max_length
 * @return {{hoverProjectName: String, displayedProjectLabel: String}}
 */
function getProjectLabel(isProjectLoaded, projectName, translate, projectNickname, project_max_length) {
  const projectLabel = isProjectLoaded ? projectName : translate('project');
  let hoverProjectName = '';
  let displayedProjectLabel = projectNickname ? translate("projects.current_project", {project: projectNickname}) : projectLabel;
  if (displayedProjectLabel && (displayedProjectLabel.length > project_max_length)) {
    hoverProjectName = projectNickname;
    displayedProjectLabel = displayedProjectLabel.substr(0, project_max_length - 1) + '…'; // truncate with ellipsis
  }
  return {hoverProjectName, displayedProjectLabel};
}

/**
 * The home stepper
 */
class HomeStepper extends Component {

  componentDidMount () {
    const {stepIndex, goToStep} = this.props;
    if (stepIndex === 0) goToStep(0);
  }

  render () {
    const {
      activeSteps,
      stepIndex,
      translate,
      isUserLoggedIn,
      username,
      isProjectLoaded,
      projectName,
      projectNickname,
      goToStep
    } = this.props;

    const userLabel = isUserLoggedIn ? username : translate('user');
    const project_max_length = 20;
    const {hoverProjectName, displayedProjectLabel} = getProjectLabel(isProjectLoaded, projectName, translate,
            projectNickname, project_max_length);

    const labels = [
      translate('home'),
      userLabel,
      displayedProjectLabel,
      translate('tool')
    ];
    const colors = bodyUIHelpers.getIconColorFromIndex(stepIndex, activeSteps);
    const icons = [
      'home',
      'user',
      'folder-open',
      'wrench'
    ];
    const popover = [
      '',
      '',
      hoverProjectName,
      ''
    ];

    const styles = {
      container: {
        display: 'flex',
        flexDirection: 'row',
        padding: '5px 0'
      },
      stepper: {
        flexGrow: 1,
        padding: '0 50px',
        borderRight: 'solid 1px #ccc'
      },
      menu: {
        padding: '0 50px',
        margin: 'auto 0'
      }
    };

    return (
      <MuiThemeProvider>
        <Card>
          <div style={styles.container}>
            <Stepper activeStep={stepIndex} style={styles.stepper}>
              {activeSteps.map((enabled, index) => (
                <HomeStep key={index}
                          color={colors[index]}
                          enabled={enabled}
                          iconName={icons[index]}
                          onClick={() => goToStep(index)}
                          label={` ${labels[index]} `}
                          popover={popover[index]}/>
              ))}
            </Stepper>
            <div style={styles.menu}>
              <AppMenu translate={translate}/>
            </div>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

HomeStepper.propTypes = {
  isUserLoggedIn: PropTypes.bool,
  isProjectLoaded: PropTypes.bool,
  username: PropTypes.string,
  projectName: PropTypes.string,
  stepIndex: PropTypes.number,
  activeSteps: PropTypes.array,
  goToStep: PropTypes.func,
  translate: PropTypes.func.isRequired,
  projectNickname: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeStepper);
