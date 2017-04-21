import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import HomeButton from '../../components/home/stepper/HomeButton'
import Stepper from '../../components/home/stepper/Stepper'
// actions
// import {actionCreator} from 'actionCreatorPath'

class StepperContainer extends Component {
  render() {
    return (
      <div>
        <HomeButton {...this.props} />
        <Stepper {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    prop: state.prop
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch1: () => {
      // dispatch(actionCreator);
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StepperContainer);
