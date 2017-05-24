const React = require('react');
const Table = require('reactable').Table;

class RecentProjects extends React.Component {
  render() {
    return (
      <div style={{ height: '520px', padding: '0 10px', overflowY: 'auto' }}>
        <Table sortable={true} noDataText="No Recent Projects Found" className="table" id="recentProjects" data={this.props.data} />
      </div>
    );
  }
}
exports.Component = RecentProjects;
