import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';


const ProjectValidationNavigation = (props) => {
  let {
    stepper: {
      previousStepName,
      nextDisabled,
      stepIndex
    },
    onlyShowProjectInformationScreen
  } = props.reducers.projectValidationReducer;
  // Getting the finalize function from the corresponding step index
  let finalize;
  switch (stepIndex) {
    case 1:
      finalize = props.actions.finalizeCopyrightCheck;
      break;
    case 2:
      finalize = onlyShowProjectInformationScreen ? props.actions.saveAndCloseProjectInformationCheck : props.actions.finalizeProjectInformationCheck;
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
      <button className='btn-second' onClick={onlyShowProjectInformationScreen ? props.actions.cancelAndCloseProjectInformationCheck : props.actions.cancel}>
        {previousStepName}
      </button>
      <button className='btn-prime' onClick={finalize} disabled={nextDisabled}>
        {
          onlyShowProjectInformationScreen ? 'Save Changes'
          :
          <div>
            <span>Continue</span>
            <Glyphicon glyph='share-alt' style={{ marginLeft: '10px' }} />
          </div>
        }
      </button>
    </div>
  );
};


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
};

export default ProjectValidationNavigation;