import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Glyphicon} from 'react-bootstrap';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import FeedbackIcon from 'material-ui/svg-icons/action/question-answer';
import SyncIcon from 'material-ui/svg-icons/notification/sync';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import { Card } from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel
} from 'material-ui/Stepper';
//helpers
import * as bodyUIHelpers from '../../../helpers/bodyUIHelpers';
import PopoverMenu from '../../PopoverMenu';
import MenuItem from 'material-ui/MenuItem';

class StepperComponent extends Component {
  constructor(props) {
    super(props);
    this.handleChangeLocale = this.handleChangeLocale.bind(this);
    this.handleUpdateApp = this.handleUpdateApp.bind(this);
    this.handleFeedback = this.handleFeedback.bind(this);
  }

  componentDidMount() {
    const { stepIndex } = this.props.homeScreenReducer.stepper;
    if (stepIndex === 0) this.props.actions.goToStep(0);
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

  handleFeedback() {
    // TODO: send feedback
  }

  render() {
    const { stepIndex, stepIndexAvailable, stepperLabels } = this.props.homeScreenReducer.stepper;

    //icons
    let [ homeColor, userColor, projectColor, toolColor ] = bodyUIHelpers.getIconColorFromIndex(stepIndex, stepIndexAvailable);
    const homeIcon = <Glyphicon glyph={"home"} style={{color: homeColor, fontSize: "25px"}}/>; // step 0
    const userIcon = <Glyphicon glyph={"user"} style={{color: userColor, fontSize: "25px"}}/>; // step 1
    const projectIcon = <Glyphicon glyph={"folder-open"} style={{color: projectColor, fontSize: "25px"}}/>; // step 2
    const toolIcon = <Glyphicon glyph={"wrench"} style={{color: toolColor, fontSize: "25px"}}/>; // step 3

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
      },
      step: {
        maxWidth:150,
        whiteSpace:'nowrap',
        textOverflow:'ellipsis',
        overflow:'hidden'
      },
      icon: {
        margin: '0 10px -5px 0'
      }
    };

    return (
      <MuiThemeProvider>
        <Card>
          <div style={styles.container}>
            <Stepper activeStep={stepIndex} style={styles.stepper}>
              <Step disabled={!stepIndexAvailable[0]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(0)} icon={homeIcon}>
                  <span style={{...styles.step, color: homeColor}}>{` ${stepperLabels[0]} `}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[1]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(1)} icon={userIcon}>
                  <span style={{...styles.step, color: userColor}}>{` ${stepperLabels[1]} `}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[2]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(2)} icon={projectIcon}>
                  <span style={{...styles.step, color: projectColor}}>{` ${stepperLabels[2]} `}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[3]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(3)} icon={toolIcon}>
                  <span style={{...styles.step, color: toolColor}}>{` ${stepperLabels[3]} `}</span>
                </StepLabel>
              </Step>
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

StepperComponent.propTypes = {
    homeScreenReducer: PropTypes.any.isRequired,
    actions: PropTypes.shape({
        goToStep: PropTypes.func.isRequired
    })
};

export default StepperComponent;
