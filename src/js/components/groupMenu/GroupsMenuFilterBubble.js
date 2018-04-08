import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

class GroupsMenuFilterBubble extends React.Component {

  handleFilterRemove() {
    this.props.setFilter(this.props.name, false);
  }

  render() {
    return (
      <span className="filter-bubble">
        <Glyphicon className='filter-remove' glyph='remove' onClick={this.handleFilterRemove.bind(this)} />
        <span className="filter-text">{this.props.text}</span>
      </span>
    );
  }
}

GroupsMenuFilterBubble.propTypes = {
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired
};

export default GroupsMenuFilterBubble;
