import React, { Component } from 'react'
import {Glyphicon} from 'react-bootstrap'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';

class StepperComponent extends Component {
  // TODO: move state to reducer.
  constructor() {
    super();
    this.state = {
      finished: false,
      stepIndex: 0
    };
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
  }

  // TODO: move function as actions to actions file.
  handleNext() {
    const stepIndex = this.state.stepIndex;
    console.log(stepIndex)
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    });
  }

  handlePrev() {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  }

  render() {
    const {stepIndex} = this.state;
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
