import React, { Component } from 'react';
import PropTypes from 'prop-types';

class HomeScreenNavigation extends Component {

  button(text, onclick, disabled) {
    if(text) {
      return (
        <button className='btn-second' disabled={disabled} onClick={onclick}>
          {text}
        </button>
      );
    } else {
      return <span style={{ width: '200px'}}></span>;
    }
  }

  render() {
    let { goToNextStep, goToPrevStep} = this.props.actions
    let { stepIndex, previousStepName, nextStepName, nextDisabled } = this.props.reducers.homeScreenReducer.stepper;
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

HomeScreenNavigation.propTypes = {
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired
};

export default HomeScreenNavigation
