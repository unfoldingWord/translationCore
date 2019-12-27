import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const TooltipComponent = ({
  id,
  children,
  placement,
  tooltipMessage,
}) => (
  <OverlayTrigger
    overlay={<Tooltip id={id} className="my-tooltip-class">{tooltipMessage}</Tooltip>}
    placement={placement}
    delayShow={300}
    delayHide={150}
  >
    {children}
  </OverlayTrigger>
);

TooltipComponent.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  tooltipMessage: PropTypes.string.isRequired,
  placement: PropTypes.string,
};

TooltipComponent.defaultProps = { placement: 'top' };


export default TooltipComponent;
