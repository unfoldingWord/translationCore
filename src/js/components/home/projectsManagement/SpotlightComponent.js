import React, { Component } from 'react';
import Spotlight from 'react-spotlight-clickable';
import PropTypes from 'prop-types';

export default class SpotlightComponent extends Component {
  render() {
    return (
      <div>
        <Spotlight
          x={0}
          y={0}
          radius={0}
          color="white"
          responsive
          animSpeed={1000}
          borderColor="#ddd"
          borderWidth={10}
          zIndex={0}>
          {this.props.children}
        </Spotlight>
      </div>
    );
  }
}

SpotlightComponent.propTypes = {
  children: PropTypes.element
};
