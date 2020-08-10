import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
import { Stepper } from 'material-ui/Stepper';
import { connect } from 'react-redux';
import * as bodyUIHelpers from '../../../helpers/bodyUIHelpers';
import * as ProjectDetailsHelpers from '../../../helpers/ProjectDetailsHelpers';
import { goToStep } from '../../../actions/BodyUIActions';
import AppMenu from '../../../containers/AppMenu';
import {
  getIsUserLoggedIn,
  getUsername,
  getProjectSaveLocation,
  getHomeScreenStep,
  getActiveHomeScreenSteps,
  getProjectNickname,
  getProjectName,
  getSelectedToolTitle,
} from '../../../selectors';
import HomeStep from './HomeStep';

/**
 * The home stepper
 */
class HomeStepper extends Component {
  componentDidMount() {
    const { stepIndex, goToStep } = this.props;

    if (stepIndex === 0) {
      goToStep(0);
    }
  }

  render() {
    const {
      activeSteps,
      stepIndex,
      translate,
      isUserLoggedIn,
      username,
      isProjectLoaded,
      projectName,
      projectNickname,
      goToStep,
      toolName,
    } = this.props;

    const userLabel = isUserLoggedIn ? username : translate('user');
    const project_max_length = 20;
    const { hoverProjectName, displayedProjectLabel } = ProjectDetailsHelpers.getProjectLabel(isProjectLoaded, projectName,
      translate, projectNickname, project_max_length);

    const toolLabel = toolName || translate('tool');
    const labels = [
      translate('home'),
      userLabel,
      displayedProjectLabel,
      toolLabel,
    ];
    const colors = bodyUIHelpers.getIconColorFromIndex(stepIndex, activeSteps);
    const icons = [
      'home',
      'user',
      'folder-open',
      'wrench',
    ];
    const popover = [
      '',
      '',
      hoverProjectName,
      '',
    ];

    const styles = {
      container: {
        display: 'flex',
        flexDirection: 'row',
        padding: '5px 0',
      },
      stepper: {
        flexGrow: 1,
        padding: '0 50px',
        borderRight: 'solid 1px #ccc',
      },
      menu: {
        padding: '0 50px',
        margin: 'auto 0',
      },
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
  projectNickname: PropTypes.string,
  toolName: PropTypes.string,
};

const mapStateToProps = (state) => {
  const projectSaveLocation = getProjectSaveLocation(state);
  return {
    isUserLoggedIn: getIsUserLoggedIn(state),
    username: getUsername(state),
    isProjectLoaded: !!projectSaveLocation,
    projectName: getProjectName(state),
    stepIndex: getHomeScreenStep(state),
    activeSteps: getActiveHomeScreenSteps(state),
    projectNickname: getProjectNickname(state),
    toolName: getSelectedToolTitle(state),
  };
};

const mapDispatchToProps = { goToStep };

export default connect(mapStateToProps, mapDispatchToProps)(HomeStepper);
