import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';


const ProjectValidationNavigation = (props) => {
  let { previousStepName, nextStepName, nextDisabled, stepIndex } = props.reducers.projectValidationReducer.stepper;
  /**Getting the finalize function from the corresponding step index*/
  let finalize;
  switch (stepIndex) {
    case 1:
      finalize = props.actions.finalizeCopyrightCheck;
      break;
    case 2:
      finalize = props.actions.finalizeProjectInformationCheck;
      break;
    case 3:
      finalize = props.actions.finalizeMergeConflictCheck;
      break;
    case 4:
      finalize = props.actions.finalizeMissingVersesCheck;
      break;
    default:
      break;
  }
  return (
    <div>
      <button className='btn-second' onClick={props.actions.cancel}>
        {previousStepName}
      </button>
      <button className='btn-prime' onClick={finalize} disabled={nextDisabled}>
        Continue
        <Glyphicon glyph='share-alt' style={{ marginLeft: '10px' }} />
      </button>
    </div>
  )
}


ProjectValidationNavigation.propTypes = {
  reducers: PropTypes.shape({
    projectValidationReducer: PropTypes.shape({
      stepper: PropTypes.shape({
        stepIndex: PropTypes.number.isRequired,
        nextDisabled: PropTypes.bool.isRequired,
        nextStepName: PropTypes.string.isRequired,
        previousStepName: PropTypes.string.isRequired
      })
    })
  }),
  actions: PropTypes.object.isRequired
}

export default ProjectValidationNavigation;