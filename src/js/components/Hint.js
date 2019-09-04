import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Hint extends Component {
  render() {
    let position = this.props.position || 'top';
    let size = this.props.size || 'medium';
    let className = `hint--${position} hint--${size}`;
    let label = this.props.label || '';
    let enable = true;

    if ( this.props.hasOwnProperty('enabled') ) {
      enable = this.props.enabled;
    }

    if (enable===true) {
      return (
        <span
          className={className}
          aria-label={label}>
          {this.props.children}
        </span>
      );
    } else {
      return (
        <span>
          {this.props.children}
        </span>
      );
    }
  }
}

Hint.propTypes = {
  children: PropTypes.any,
  size: PropTypes.any,
  position: PropTypes.any,
  label: PropTypes.any,
  enabled: PropTypes.any,
};

export default Hint;
