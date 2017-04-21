import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import Instructions from '../../components/home/Instructions'
import Navigation from '../../components/home/Navigation'
// containers
import StepperContainer from './StepperContainer'
import DisplayContainer from './DisplayContainer'
// actions
// import {actionCreator} from 'actionCreatorPath'

class MainContainer extends Component {
  render() {
    return (
      <div>
        <StepperContainer {...this.props} />
        <Instructions {...this.props} />
        <DisplayContainer {...this.props} />
        <Navigation {...this.props} />
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
)(MainContainer);
