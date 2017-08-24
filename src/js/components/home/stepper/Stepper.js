import React, { Component } from 'react'
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Glyphicon} from 'react-bootstrap';
import { Card } from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel
} from 'material-ui/Stepper';

class StepperComponent extends Component {
  render() {
    const { stepIndex, stepIndexAvailable } = this.props.homeScreenReducer.stepper;
    console.log(this.props)
    // colors
    let homeColor = stepIndex >= 0 ? "var(--accent-color-dark)" : "";
    let userColor = stepIndex >= 1 ? "var(--accent-color-dark)" : "";
    let projectColor = stepIndex >= 2 ? "var(--accent-color-dark)" : "";
    let toolColor = stepIndex >= 3 ? "var(--accent-color-dark)" : "";
    //icons
    const homeIcon = <Glyphicon glyph={"home"} style={{color: homeColor, fontSize: "25px"}}/> // step 0
    const userIcon = <Glyphicon glyph={"user"} style={{color: userColor, fontSize: "25px"}}/> // step 1
    const projectIcon = <Glyphicon glyph={"folder-open"} style={{color: projectColor, fontSize: "25px"}}/> // step 2
    const toolIcon = <Glyphicon glyph={"wrench"} style={{color: toolColor, fontSize: "25px"}}/> // step 3

    return (
      <MuiThemeProvider>
        <Card>
          <div style={{width: '100%', maxWidth: '100%', margin: 'auto'}}>
            <Stepper activeStep={stepIndex} style={{padding: '0 50px'}}>
              <Step disabled={!stepIndexAvailable[0]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(0)} icon={homeIcon}>
                  <span style={{color: homeColor}}>{" Home "}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[1]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(1)} icon={userIcon}>
                  <span style={{color: userColor}}>{" User "}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[2]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(2)} icon={projectIcon}>
                  <span style={{color: projectColor}}>{" Project "}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[3]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(3)} icon={toolIcon}>
                  <span style={{color: toolColor}}>{" Tool "}</span>
                </StepLabel>
              </Step>
            </Stepper>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

export default StepperComponent;
