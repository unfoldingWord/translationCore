import { connect } from 'react-redux'
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import {Glyphicon} from 'react-bootstrap';
//actions
import * as ProjectValidationActions from '../actions/ProjectValidationActions';
//components
import ProjectValidationStepper from '../components/projectValidation/ProjectValidationStepper';
import ProjectValidationInstructions from '../components/projectValidation/ProjectValidationInstructions';
import CopyRightCheck from '../components/projectValidation/CopyRightCheck';
import ProjectInformationCheck from '../components/projectValidation/ProjectInformationCheck';
import MergeConflictsCheck from '../components/projectValidation/MergeConflictsCheck';
import MissingVersesCheck from '../components/projectValidation/MissingVersesCheck';

class ProjectValidationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    let { stepIndex, previousStepName, nextStepName, nextDisabled } = this.props.reducers.projectValidationReducer.stepper;

    const actions = [
      <button className='btn-second'
        onClick={this.props.actions.previousStep}>
        <Glyphicon glyph='share-alt' style={{ marginRight: '10px', transform: 'scaleX(-1)' }} />
        {previousStepName}
      </button>,
      <button className='btn-prime'
          onClick={this.props.actions.nextStep}>
        {nextStepName}
        <Glyphicon glyph='share-alt' style={{marginLeft: '10px'}} />
      </button>
    ];


    const customContentStyle = {
      opacity: "1",
      width: '90%',
      maxWidth: 'none',
      height: '100%',
      maxHeight: 'none',
      padding: 0,
      top: -30
    };

    const { showProjectValidationStepper } = this.props.reducers.projectValidationReducer;

    let displayContainer = <div />;
    switch (stepIndex) {
      case 1:
        displayContainer = <CopyRightCheck {...this.props} />;
        break;
      case 2:
        displayContainer = <ProjectInformationCheck {...this.props} />;
        break;
      case 3:
        displayContainer = <MergeConflictsCheck {...this.props} />;
        break;
      case 4:
        displayContainer = <MissingVersesCheck {...this.props} />;
        break;
      default:
        break;
    }
    return (
      <MuiThemeProvider>
        <Dialog
          actions={actions}
          modal={true}
          style={{ padding: "0px", zIndex: 2501 }}
          contentStyle={customContentStyle}
          bodyStyle={{ padding: 0, minHeight: '80vh' }}
          open={showProjectValidationStepper}>
          <ProjectValidationStepper {...this.props} />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '70%' }}>
            <div style={{ width: '400px' }}>
              <ProjectValidationInstructions {...this.props} />
            </div>
            <div style={{ width: '600px', marginBottom: '25px' }}>
              {displayContainer}
            </div>
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    reducers: {
      projectValidationReducer: state.projectValidationReducer
    }
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      showStepper: (val) => {
        dispatch(ProjectValidationActions.showStepper(val));
      },
      previousStep: () => {
        dispatch(ProjectValidationActions.goToPreviousProjectValidationStep());
      },
      nextStep: () => {
        dispatch(ProjectValidationActions.goToNextProjectValidationStep());
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectValidationContainer)