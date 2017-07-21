import React, { Component } from 'react'

class BackNavigation extends Component {

  button(text, onclick, disabled) {
    return (
      <button className='btn-second' disabled={disabled} onClick={onclick}>
        {text}
      </button>
    )
  }

  render() {
    let { goToNextStep, goToPrevStep} = this.props.actions
    let {stepIndex, previousStepName, nextStepName, nextDisabled} = this.props.reducers.homeScreenReducer.stepper;
    let backDisabled = false;
    switch (stepIndex) {
      case 0:
        backDisabled = true;
        break;
      default:
        break;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
        {this.button(previousStepName, goToPrevStep, backDisabled)}
        {this.button(nextStepName, goToNextStep, nextDisabled)}
      </div>
    )
  }
}

export default BackNavigation
