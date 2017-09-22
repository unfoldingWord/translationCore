import React, { Component } from 'react';

class ElementWithPopover extends Component {
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

export default ElementWithPopover;