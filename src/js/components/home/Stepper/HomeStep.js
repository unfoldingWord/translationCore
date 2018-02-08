import React from 'react';
import PropTypes from 'prop-types';
import { Step, StepLabel } from 'material-ui/Stepper';
import ColoredIcon from './ColoredIcon';

/**
 * A single step within the home stepper
 * @param {bool} enabled indicates if this step is enabled or disabled
 * @param {string} iconName the name of the icon to be used
 * @param {string} color the color of the step
 * @param {string} label the step name
 * @param {func} onClick called when the step is clicked
 * @return {*}
 * @constructor
 */
const HomeStep = ({enabled, iconName, color, label, onClick}) => (
  <Step disabled={!enabled}
        style={{cursor: 'pointer'}}>
    <StepLabel onClick={onClick}
               icon={<ColoredIcon icon={iconName} color={color}/>}>
                  <span style={{
                    color: color,
                    maxWidth: 150,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>{label}</span>
    </StepLabel>
  </Step>
);
HomeStep.propTypes = {
  enabled: PropTypes.bool.isRequired,
  iconName: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default HomeStep;
