import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  getHomeScreenStep,
  getNextHomeScreenStepDisabled
} from '../../selectors';
import {goToNextStep, goToPrevStep} from '../../actions/BodyUIActions';

const mapStateToProps = (state) => ({
  stepIndex: getHomeScreenStep(state),
  nextDisabled: getNextHomeScreenStepDisabled(state)
});

const mapDispatchToProps = {
  goToNextStep,
  goToPrevStep
};

class HomeScreenNavigation extends Component {

  button(text, onclick, disabled) {
    if(text) {
      return (
        <button className='btn-second' disabled={disabled} onClick={onclick}>
          {text}
        </button>
      );
    } else {
      return <span style={{ width: '200px'}}/>;
    }
  }

  render() {
    let { previousStepName, nextStepName } = this.props.reducers.homeScreenReducer.stepper;

    const {stepIndex, nextDisabled, goToNextStep, goToPrevStep} = this.props;
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
    );
  }
}

HomeScreenNavigation.propTypes = {
  stepIndex: PropTypes.number,
  nextDisabled: PropTypes.bool,
  goToNextStep: PropTypes.func,
  goToPrevStep: PropTypes.func,
  reducers: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreenNavigation);
