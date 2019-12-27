import React from 'react';
import ReactTooltip from 'react-tooltip';

import PropTypes from 'prop-types';
import { Step, StepLabel } from 'material-ui/Stepper';
import ColoredIcon from './ColoredIcon';

/**
 * get regular step label - no hover
 * @param {string} iconName the name of the icon to be used
 * @param {string} color the color of the step
 * @param {string} label the step name
 * @param {func} onClick called when the step is clicked
 * @return {*}
 */
function getRegularLabel(onClick, iconName, color, label) {
  return (
    <StepLabel onClick={onClick}
      icon={<ColoredIcon icon={iconName} color={color}/>}>
      <span style={{
        color: color,
        maxWidth: 150,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}>{label}</span>
    </StepLabel>
  );
}

/**
 * get step label with hover
 * @param {string} iconName the name of the icon to be used
 * @param {string} color the color of the step
 * @param {string} label the step name
 * @param {string} popover text to show on hover if not empty
 * @param {func} onClick called when the step is clicked
 * @return {*}
 */
function getLabelWithHover(onClick, iconName, color, label, popover) {
  return (
    <StepLabel onClick={onClick}
      icon={<ColoredIcon icon={iconName} color={color}/>}>
      <span
        style={{
          color: color,
          maxWidth: 150,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
        data-tip={popover}
        data-place="bottom"
        data-effect="float"
        data-type="dark"
        data-class="selection-tooltip"
        data-delay-hide="100"
      >{label}</span>
      <ReactTooltip />
    </StepLabel>
  );
}

/**
 * A single step within the home stepper
 * @param {bool} enabled indicates if this step is enabled or disabled
 * @param {string} iconName the name of the icon to be used
 * @param {string} color the color of the step
 * @param {string} label the step name
 * @param {string} popover text to show on hover if not empty
 * @param {func} onClick called when the step is clicked
 * @return {*}
 * @constructor
 */
const HomeStep = ({
  enabled, iconName, color, label, popover, onClick,
}) => (
  <Step disabled={!enabled}
    style={{ cursor: 'pointer' }}>
    {popover ? getLabelWithHover(onClick,iconName,color,label,popover) :
      getRegularLabel(onClick,iconName,color,label)}
  </Step>
);

HomeStep.propTypes = {
  enabled: PropTypes.bool.isRequired,
  iconName: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  popover: PropTypes.string.isRequired,
};

export default HomeStep;
