import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

class GroupsMenuFilterBubble extends React.Component {

  handleFilterRemove() {
    this.props.toggleFilter(this.props.name);
  }

  render() {
    return (
      <span className="filter-bubble-wrapper">
        <span className="filter-bubble">
          <Glyphicon className='filter-remove' glyph='remove' onClick={this.handleFilterRemove.bind(this)} />
          <span className="filter-text">{this.props.text}</span>
        </span>
      </span>
    );
  }
}

GroupsMenuFilterBubble.propTypes = {
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  toggleFilter: PropTypes.func.isRequired
};

export default GroupsMenuFilterBubble;
