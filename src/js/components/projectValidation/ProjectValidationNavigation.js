import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ProjectValidationNavigation = (props) => {
  let { previousStepName, nextStepName, nextDisabled } = props.reducers.projectValidationReducer.stepper;
  return (
    <div>
      <button className='btn-second'
        onClick={props.actions.previousStep}>
        <Glyphicon glyph='share-alt' style={{ marginRight: '10px', transform: 'scaleX(-1)' }} />
        {previousStepName}
      </button>
      <button className='btn-prime'
        onClick={props.actions.nextStep}
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