import React, { Component } from 'react'
import {Glyphicon} from 'react-bootstrap'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';

class StepperComponent extends Component {
  render() {
    const {stepIndex} = this.props.BodyUIReducer.stepper;
    console.log(stepIndex)
    const userIcon = <Glyphicon glyph={"user"} style={{fontSize: "25px"}}/>
    const projectIcon = <Glyphicon glyph={"folder-open"} style={{fontSize: "25px"}}/>
    const toolIcon = <Glyphicon glyph={"wrench"} style={{fontSize: "25px"}}/>

    return (
      <Card>
        <div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
          <Stepper activeStep={stepIndex}>
            <Step>
              <StepLabel icon={userIcon}> User </StepLabel>
            </Step>
            <Step>
              <StepLabel icon={projectIcon}>{"  Project "}</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={toolIcon}> Tool </StepLabel>
            </Step>
          </Stepper>
        </div>
      </Card>
    );
  }
}

export default StepperComponent;
