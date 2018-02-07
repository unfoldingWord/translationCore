import React from 'react';
import PropTypes from 'prop-types';
import {Glyphicon} from 'react-bootstrap';

/**
 * Represents a single menu item
 * @param {*} children the body of the menu item
 * @param {string} icon the menu button icon
 * @param {func} onClick callback for click events
 * @return {*}
 * @constructor
 */
const MenuItem = ({children, icon, onClick}) => (
  <div
    style={{
      padding: '4px',
      display: 'flex',
      margin: '4px 4px 0 0'
    }}
    onClick={onClick}>
    <Glyphicon glyph={icon} style={{
      fontSize: 'large',
      margin: '0 14px 0 4px'
    }}/>
    <div>{children}</div>
  </div>
);
MenuItem.propTypes = {
  children: PropTypes.any.isRequired,
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default MenuItem;
