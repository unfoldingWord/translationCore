import React from 'react';
import PropTypes from 'prop-types';

class Groups extends React.Component {
  render() {
    return (
      <div id="groups">
        {this.props.groups}
      </div>
    );
  }
}

Groups.propTypes = {
    groups: PropTypes.any.isRequired
};

export default Groups;
