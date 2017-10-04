import React from 'react';
import PropTypes from 'prop-types';

class Groups extends React.Component {

  render() {
    return (
      <div style={{ color: "var(--reverse-color)", width: "100%" }}>
        {this.props.groups}
      </div>
    );
  }
}

Groups.propTypes = {
    groups: PropTypes.any.isRequired
};

export default Groups;
