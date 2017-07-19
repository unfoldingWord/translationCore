import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
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
  componentWillReceiveProps(nextProps) {
    this.props.actions.getStepperNextButtonIsDisabled();
  }

  render() {
    return (
      <MuiThemeProvider style={{ fontSize: '1.1em' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', background: 'var(--background-color-light)' }}>
          <StepperContainer {...this.props} />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '70%' }}>
            <div style={{ width: '400px', padding: '0 20px' }}>
              <Instructions {...this.props} />
            </div>
            <div style={{ width: '600px', padding: '0 20px', marginBottom: '25px' }}>
              <DisplayContainer {...this.props} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <BackNavigation {...this.props} />
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <strong>traslationCore {packagefile.version} </strong>
                <Glyphicon
                  glyph="info-sign"
                  style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
                  onClick={() => { }}
                />
              </div>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
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
      },
      toggleHomeView: () => {
        dispatch(BodyUIActions.toggleHomeView());
      },
      getStepperNextButtonIsDisabled: () => {
        dispatch(BodyUIActions.getStepperNextButtonIsDisabled());
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainContainer);
