import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';


const ProjectValidationNavigation = (props) => {
  let { previousStepName, nextStepName, nextDisabled, stepIndex } = props.reducers.projectValidationReducer.stepper;
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
      <button className='btn-second'
        onClick={props.actions.previousStep}>
        <Glyphicon glyph='share-alt' style={{ marginRight: '10px', transform: 'scaleX(-1)' }} />
        {previousStepName}
      </button>
      <button className='btn-prime'
        onClick={finalize}
        disabled={nextDisabled}>
        {nextStepName}
        <Glyphicon glyph='share-alt' style={{ marginLeft: '10px' }} />
      </button>
    </div>
  )
}


ProjectValidationNavigation.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default ProjectValidationNavigation;