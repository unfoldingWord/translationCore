import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Hint extends Component {
  render() {
    let position = this.props.position || 'top';
    let size = this.props.size || 'medium';
    let className = `hint--${position} hint--${size}`;
    let label = this.props.label || "";
    return (
      <span
        className={className}
        aria-label={label}>
        {this.props.children}
      </span>
    );
  }
}

Hint.propTypes = {
    children: PropTypes.any,
    size: PropTypes.any,
    position: PropTypes.any,
    label: PropTypes.any
};

export default Hint;