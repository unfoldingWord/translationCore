const React = require('react');
const Table = require('reactable').Table;
const path = require('path-extra');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const defaultSave = path.join(path.homedir(), 'translationCore');
const fs = require('fs');

class RecentProjects extends React.Component {
  render() {
    return (
      <div style={{ height: '400px', overflowY: 'scroll' }}>
        <Table sortable={true} noDataText="No Recent Projects Found" className="table" id="table" data={this.props.data} />
      </div>
    );
  }
}
exports.Component = RecentProjects;
