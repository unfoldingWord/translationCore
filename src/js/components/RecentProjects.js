import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactable';

class RecentProjects extends React.Component {
  render() {
    return (
      <div style={{ height: '520px', padding: '0 10px', overflowY: 'auto' }}>
        <Table sortable={true} noDataText="No Recent Projects Found" className="table" id="recentProjects" data={this.props.data} />
      </div>
    );
  }
}

RecentProjects.propTypes = {
     data: PropTypes.any.isRequired
};

exports.Component = RecentProjects;
