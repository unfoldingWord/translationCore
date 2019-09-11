import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getNextProjectValidationStepDisabled,
  getProjectValidationStep,
  getShowProjectInformationScreen,
  getShowOverwriteWarning,
} from '../../selectors';
import { finalize as finalizeCopyrightCheck } from '../../actions/CopyrightCheckActions';
import {
  saveAndCloseProjectInformationCheckIfValid,
  finalize as finalizeProjectInformationCheck,
  cancelAndCloseProjectInformationCheck,
} from '../../actions/ProjectInformationCheckActions';
import { finalize as finalizeMergeConflictCheck } from '../../actions/MergeConflictActions';
import { finalize as finalizeMissingVersesCheck } from '../../actions/MissingVersesActions';
import { confirmContinueOrCancelImportValidation as cancel } from '../../actions/ProjectImportStepperActions';

const ProjectValidationNavigation = (props) => {
  const {
    isNextDisabled,
    stepIndex,
    onlyShowProjectInformationScreen,
    showOverwriteWarning,
    finalizeCopyrightCheck,
    saveAndCloseProjectInformationCheckIfValid,
    finalizeProjectInformationCheck,
    finalizeMergeConflictCheck,
    finalizeMissingVersesCheck,
    cancelAndCloseProjectInformationCheck,
    cancel,
    translate,
  } = props;

  // Getting the finalize function from the corresponding step index
  let finalize;

  switch (stepIndex) {
  case 0:
    finalize = finalizeCopyrightCheck;
    break;
  case 1:
    finalize = onlyShowProjectInformationScreen ? saveAndCloseProjectInformationCheckIfValid : finalizeProjectInformationCheck;
    break;
  case 2:
    finalize = finalizeMergeConflictCheck;
    break;
  case 3:
    finalize = finalizeMissingVersesCheck;
    break;
  default:
    break;
  }

  function getSaveButtonLabel() {
    if (showOverwriteWarning) {
      return (translate('buttons.overwrite'));
    } else if (onlyShowProjectInformationScreen) {
      return (translate('save_changes'));
    }

    return (
      <div>
        <span>{translate('buttons.continue_button')}</span>
        <Glyphicon glyph='share-alt' style={{ marginLeft: '10px' }}/>
      </div>
    );
  }

  return (
    <div>
      <button className='btn-second'
        onClick={onlyShowProjectInformationScreen ? cancelAndCloseProjectInformationCheck : cancel}>
        {translate('buttons.cancel_button')}
      </button>
      <button className='btn-prime' onClick={finalize} disabled={isNextDisabled}>
        { getSaveButtonLabel() }
      </button>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isNextDisabled: getNextProjectValidationStepDisabled(state),
  stepIndex: getProjectValidationStep(state),
  onlyShowProjectInformationScreen: getShowProjectInformationScreen(state),
  showOverwriteWarning: getShowOverwriteWarning(state),
});

const mapDispatchToProps = {
  finalizeCopyrightCheck,
  saveAndCloseProjectInformationCheckIfValid,
  finalizeProjectInformationCheck,
  finalizeMergeConflictCheck,
  finalizeMissingVersesCheck,
  cancelAndCloseProjectInformationCheck,
  cancel,
};

ProjectValidationNavigation.propTypes = {
  translate: PropTypes.func.isRequired,
  isNextDisabled: PropTypes.bool,
  onlyShowProjectInformationScreen: PropTypes.bool,
  showOverwriteWarning: PropTypes.bool,
  stepIndex: PropTypes.number,
  finalizeCopyrightCheck: PropTypes.func,
  saveAndCloseProjectInformationCheckIfValid: PropTypes.func,
  finalizeProjectInformationCheck: PropTypes.func,
  finalizeMergeConflictCheck: PropTypes.func,
  finalizeMissingVersesCheck: PropTypes.func,
  cancelAndCloseProjectInformationCheck: PropTypes.func,
  cancel: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectValidationNavigation);
