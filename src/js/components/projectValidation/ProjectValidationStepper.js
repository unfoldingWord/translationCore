/* eslint-disable import/order */
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
  StepLabel,
} from 'material-ui/Stepper';
//helpers
import * as bodyUIHelpers from '../../helpers/bodyUIHelpers';

class ProjectValidationStepper extends Component {
  render() {
    const { translate, stepIndex } = this.props;
    let [ copyrightColor, projectInformationColor, mergeConflictsColor, missingVersesColor ] = bodyUIHelpers.getIconColorFromIndex(stepIndex);
    //icons
    const copyrightIcon = <CopyrightSVG style={{ color: copyrightColor, marginTop:5 }}/>; // step 1
    const projectInformationIcon = <EditIcon style={{ color: projectInformationColor, marginTop:5 }}/>; // step 2
    const mergeConflictsIcon = <WarningSVG style={{ color: mergeConflictsColor, marginTop:5 }}/>; // step 3
    const missingVersesIcon = <FormatListSVG style={{ color: missingVersesColor, marginTop:5 }}/>; // step 4

    return (
      <MuiThemeProvider>
        <Card>
          <div style={{
            width: '100%', maxWidth: '100%', margin: 'auto',
          }}>
            <Stepper activeStep={stepIndex} style={{ padding: '0 50px' }}>
              <Step>
                <StepLabel icon={copyrightIcon}>
                  <span style={{ color: copyrightColor }}>{` ${translate('copyright_check')} `}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={projectInformationIcon}>
                  <span style={{ color: projectInformationColor }}>{` ${translate('project_information')} `}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={mergeConflictsIcon}>
                  <span style={{ color: mergeConflictsColor }}>{` ${translate('project_validation.merge_conflicts')} `}</span>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel icon={missingVersesIcon}>
                  <span style={{ color: missingVersesColor }}>{` ${translate('missing_verses')} `}</span>
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
  stepIndex: PropTypes.number.isRequired,
  translate: PropTypes.func.isRequired,
};

export default ProjectValidationStepper;
