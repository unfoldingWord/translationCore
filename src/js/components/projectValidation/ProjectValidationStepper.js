import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EditIcon from 'material-ui/svg-icons/image/edit';
import CopyrightSVG from 'material-ui/svg-icons/action/copyright';
import WarningSVG from 'material-ui/svg-icons/alert/warning';
import FormatListSVG from 'material-ui/svg-icons/editor/format-list-numbered';
import { Card } from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel
} from 'material-ui/Stepper';
//helpers
import * as bodyUIHelpers from '../../helpers/bodyUIHelpers';

class ProjectValidationStepper extends Component {
  render() {
    const {stepIndex} = this.props.reducers.projectValidationReducer.stepper;
    let [ copyrightColor, projectInformationColor, mergeConflictsColor, missingVersesColor ] = bodyUIHelpers.getIconColorFromIndex(stepIndex, []);
    //icons
    const copyrightIcon = <CopyrightSVG style={{color: copyrightColor, marginTop:5}}/>; // step 1
    const projectInformationIcon = <EditIcon style={{color: projectInformationColor, marginTop:5}}/>; // step 2
    const mergeConflictsIcon = <WarningSVG style={{color: mergeConflictsColor, marginTop:5}}/>; // step 3
    const missingVersesIcon = <FormatListSVG style={{color: missingVersesColor, marginTop:5}}/>; // step 4

    return (
      <MuiThemeProvider>
        <Card>
          <div style={{width: '100%', maxWidth: '100%', margin: 'auto'}}>
            <Stepper activeStep={stepIndex} style={{padding: '0 50px'}}>
              <Step>
                <StepLabel icon={copyrightIcon}>
                  <span style={{color: copyrightColor}}>{" Copyright Check "}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={projectInformationIcon}>
                  <span style={{color: projectInformationColor}}>{" Project Information "}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={mergeConflictsIcon}>
                  <span style={{color: mergeConflictsColor}}>{" Merge Conflicts "}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={missingVersesIcon}>
                  <span style={{color: missingVersesColor}}>{" Missing Verses "}</span>
                </StepLabel>
              </Step>
            </Stepper>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

ProjectValidationStepper.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default ProjectValidationStepper;
