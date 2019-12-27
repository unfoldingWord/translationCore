import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

/**
 * A colored icon used in a home step
 * @param {string} icon
 * @param {string} color
 * @return {*} a colored icon
 * @constructor
 */
const ColoredIcon = ({ icon, color }) => (
  <Glyphicon glyph={icon}
    style={{ color: color, fontSize: '25px' }}/>
);

ColoredIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default ColoredIcon;
