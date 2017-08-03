import React, { Component } from 'react'
import PropTypes from 'prop-types';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Glyphicon} from 'react-bootstrap';
import { Card } from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel
} from 'material-ui/Stepper';

class ProjectValidationStepper extends Component {
  render() {
    const {stepIndex} = this.props.reducers.projectValidationReducer.stepper;
    // colors
    let homeColor = stepIndex > 0 ? "var(--accent-color-dark)" : "";
    let userColor = stepIndex > 1 ? "var(--accent-color-dark)" : "";
    let projectColor = stepIndex > 2 ? "var(--accent-color-dark)" : "";
    let toolColor = stepIndex > 3 ? "var(--accent-color-dark)" : "";
    //icons
    const homeIcon = <Glyphicon glyph={"copyright-mark"} style={{color: homeColor, fontSize: "25px"}}/> // step 1
    const userIcon = <Glyphicon glyph={"education"} style={{color: userColor, fontSize: "25px"}}/> // step 2
    const projectIcon = <Glyphicon glyph={"warning-sign"} style={{color: projectColor, fontSize: "25px"}}/> // step 3
    const toolIcon = <Glyphicon glyph={"tasks"} style={{color: toolColor, fontSize: "25px"}}/> // step 4

    return (
      <MuiThemeProvider>
        <Card>
          <div style={{width: '100%', maxWidth: '100%', margin: 'auto'}}>
            <Stepper activeStep={stepIndex - 1} style={{padding: '0 50px'}}>
              <Step>
                <StepLabel icon={homeIcon}>
                  <span style={{color: homeColor}}>{" Copyright Check "}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={userIcon}>
                  <span style={{color: userColor}}>{" Project Information "}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={projectIcon}>
                  <span style={{color: projectColor}}>{" Merge Conflicts "}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={toolIcon}>
                  <span style={{color: toolColor}}>{" Missing Verses "}</span>
                </StepLabel>
              </Step>
            </Stepper>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

ProjectValidationStepper.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default ProjectValidationStepper;
