import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card } from 'material-ui/Card';
import { Stepper } from 'material-ui/Stepper';
import * as bodyUIHelpers from '../../../helpers/bodyUIHelpers';
import {goToStep} from '../../../actions/BodyUIActions';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import FeedbackIcon from 'material-ui/svg-icons/action/question-answer';
import SyncIcon from 'material-ui/svg-icons/notification/sync';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PopoverMenu from '../../PopoverMenu';
import MenuItem from 'material-ui/MenuItem';
import HomeStep from './HomeStep';
import {
  getIsUserLoggedIn,
  getUsername,
  getProjectSaveLocation,
  getHomeScreenStep,
  getActiveHomeScreenSteps
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
    activeSteps: getActiveHomeScreenSteps(state)
  };
};

const mapDispatchToProps = {
  goToStep
};

/**
 * The home stepper
 */
class HomeStepper extends Component {

  constructor(props) {
    super(props);
    this.handleChangeLocale = this.handleChangeLocale.bind(this);
    this.handleUpdateApp = this.handleUpdateApp.bind(this);
    this.handleFeedback = this.handleFeedback.bind(this);
  }

  componentDidMount () {
    const {stepIndex, goToStep} = this.props;
    if (stepIndex === 0) goToStep(0);
  }

  /**
   * Handles menu clicks to change app locale settings
   */
  handleChangeLocale() {
    // TODO: change the locale
  }

  /**
   * Handles menu clicks to check for app updates
   */
  handleUpdateApp() {
    // TODO: check for app updates
  }

  /**
   * Handles menu clicks to submit feedback
   */
  handleFeedback() {
    // TODO: send feedback
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
      goToStep
    } = this.props;

    const userLabel = isUserLoggedIn ? username : translate('user');
    const projectLabel = isProjectLoaded ? projectName : translate('project');
    const labels = [
      translate('home_label'),
      userLabel,
      projectLabel,
      translate('tool_label')
    ];
    const colors = bodyUIHelpers.getIconColorFromIndex(stepIndex, activeSteps);
    const icons = [
      'home',
      'user',
      'folder-open',
      'wrench'
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
                          label={` ${labels[index]} `}/>
              ))}
            </Stepper>
            <div style={styles.menu}>
              <PopoverMenu label="Actions"
                           primary={true}
                           icon={<SettingsIcon/>}>
                <MenuItem onClick={this.handleUpdateApp}
                          primaryText="Check for Software Updates"
                          leftIcon={<SyncIcon/>}/>
                <MenuItem onClick={this.handleFeedback}
                          primaryText="User Feedback"
                          leftIcon={<FeedbackIcon/>}/>
                <MenuItem onClick={this.handleChangeLocale}
                          primaryText="Change User Interface Language"
                          leftIcon={<TranslateIcon/>}/>
              </PopoverMenu>
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
  translate: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeStepper);
