import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';

const ProjectValidationNavigation = (props) => {
    let { previousStepName, nextStepName } = props.reducers.projectValidationReducer.stepper;
    return (
        <div>
            <button className='btn-second'
                onClick={props.actions.previousStep}>
                <Glyphicon glyph='share-alt' style={{ marginRight: '10px', transform: 'scaleX(-1)' }} />
                {previousStepName}
            </button>
            <button className='btn-prime'
                onClick={props.actions.nextStep}>
                {nextStepName}
                <Glyphicon glyph='share-alt' style={{ marginLeft: '10px' }} />
            </button>
        </div>
    )
}

export default ProjectValidationNavigation;