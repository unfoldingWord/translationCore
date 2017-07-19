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
          zIndex={0}
          responsive
          color="white"
          borderWidth={10}
          animSpeed={1000}
          borderColor="#ddd"
         >
          {this.props.children}
        </Spotlight>
      </div>
    );
  }
}

SpotlightComponent.propTypes = {
  children: PropTypes.element
};
