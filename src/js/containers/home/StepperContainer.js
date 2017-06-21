import React, { Component } from 'react'
import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import Stepper from '../../components/home/stepper/Stepper'
// actions
// import {actionCreator} from 'actionCreatorPath'

class StepperContainer extends Component {
  render() {
    return (
      <div>
        <MuiThemeProvider>
          <Stepper {...this.props} />
        </MuiThemeProvider>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    BodyUIReducer: state.BodyUIReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      dispatch1: () => {
        // dispatch(actionCreator);
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StepperContainer);
