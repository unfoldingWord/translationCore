import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getHomeScreenStep,
  getNextHomeScreenStepDisabled,
} from '../../selectors';
import { goToNextStep, goToPrevStep } from '../../actions/BodyUIActions';

/**
 * A button in the Home Navigation
 * @param text
 * @param onClick
 * @param disabled
 * @return {*}
 * @constructor
 */
const NavButton = ({
  text, onClick, disabled,
}) => {
  if (text) {
    return (
      <button className='btn-second' disabled={disabled} onClick={onClick}>
        {text}
      </button>
    );
  } else {
    return <span style={{ width: '200px' }}/>;
  }
};

NavButton.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

/**
 * The home navigation
 */
class HomeScreenNavigation extends Component {
  render() {
    const {
      translate,
      stepIndex,
      isNextDisabled,
      goToNextStep,
      goToPrevStep,
    } = this.props;

    const labels = [
      translate('buttons.home_button'),
      translate('buttons.go_to_user_button'),
      translate('buttons.go_to_project_button'),
      translate('buttons.go_to_tools_button'),
    ];

    const backDisabled = stepIndex === 0;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
        <NavButton text={labels[stepIndex - 1]}
          onClick={goToPrevStep}
          disabled={backDisabled}/>
        <NavButton text={labels[stepIndex + 1]}
          onClick={goToNextStep}
          disabled={isNextDisabled}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  stepIndex: getHomeScreenStep(state),
  isNextDisabled: getNextHomeScreenStepDisabled(state),
});

const mapDispatchToProps = {
  goToNextStep,
  goToPrevStep,
};

HomeScreenNavigation.propTypes = {
  translate: PropTypes.func.isRequired,
  stepIndex: PropTypes.number,
  isNextDisabled: PropTypes.bool,
  goToNextStep: PropTypes.func,
  goToPrevStep: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(
  HomeScreenNavigation);
