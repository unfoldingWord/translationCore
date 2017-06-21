import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-bootstrap';
// components
import Instructions from '../../components/home/instructions/Instructions';
import BackNavigation from '../../components/home/BackNavigation';
// containers
import StepperContainer from './StepperContainer';
import DisplayContainer from './DisplayContainer';
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';
// info
import packagefile from '../../../../package.json';

class MainContainer extends Component {
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', background: 'var(--background-color-light)' }}>
        <StepperContainer {...this.props} />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '70%' }}>
          <div style={{ width: '400px', padding: '0 20px' }}>
            <Instructions {...this.props} />
          </div>
          <div style={{ width: '600px', padding: '0 20px' }}>
            <DisplayContainer {...this.props} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <BackNavigation {...this.props} />
            <div>
              traslationCore <span>{packagefile.version}</span> (i)
            </div>
          </div>
        </div>
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
    actions: {
      goToNextStep: () => {
        dispatch(BodyUIActions.goToNextStep());
      },
      goToPrevStep: () => {
        dispatch(BodyUIActions.goToPrevStep());
      },
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainContainer);
