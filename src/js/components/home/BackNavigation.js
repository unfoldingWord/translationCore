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
    let {stepIndex} = this.props.reducers.BodyUIReducer.stepper;
    let backDisabled = false, nextDisabled = false;
    switch (stepIndex) {
      case 0:
        backDisabled = true;
        break;
      case 3:
        nextDisabled = true;
        break;
      default:
        break;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
        {this.button('Go back', goToPrevStep, backDisabled)}
        {this.button('Next', goToNextStep, nextDisabled)}
      </div>
    )
  }
}

export default BackNavigation
