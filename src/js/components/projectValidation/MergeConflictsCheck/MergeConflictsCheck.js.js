import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MergeConflictsCheck extends Component {
  render() {
    return (
      <div>
        {this.props.conflictCards}
      </div>
    );
  }
}

MergeConflictsCheck.propTypes = {
  conflictCards: PropTypes.array.isRequired,
}

export default MergeConflictsCheck;