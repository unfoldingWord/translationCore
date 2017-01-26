const React = require('react');
const Table = require('reactable').Table;
const unsafe = require('reactable').unsafe;
const path = require('path-extra');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const defaultSave = path.join(path.homedir(), 'translationCore');
const fs = require('fs');

class RecentProjects extends React.Component {
  generateDisplay() {
    var projectPaths = this.props.projects;
    var projects = [];
    for (var project in projectPaths) {
      var projectPath = path.join(defaultSave, projectPaths[project]);
      var projectName = projectPaths[project];
      if (projectName === '.DS_Store' || projectName === '.git') continue;
      var manifestLocation = path.join(projectPath, 'manifest.json');
      var manifest = {};
      try {
          manifest = require(manifestLocation);
      } catch(err) {
        // Happens with USFM projects
          manifest =  {target_language: {}, project: {}}
      }
      var stats = fs.statSync(projectPath);
      var mtime = new Date(stats.mtime);
      var difference = mtime.getMonth() + 1 + '/' + mtime.getDate() + '/' + mtime.getFullYear()
      projects.push(
        {
          '': <Glyphicon glyph={'folder-open'} /> ,
          'Project Name': projectName,
          'Book': manifest.project.name || 'Unknown',
          'Language': manifest.target_language.name || 'Unknown',
          'Date Updated': difference,
          ' ': <Button style={{backgroundColor: '#C3105A', borderWidth: '0px', backgroundImage: 'linear-gradient(to bottom,#C3105A 0,#C3105A 100%)', color: 'white'}} onClick={this.props.onLoad.bind(this, projectPath)}><Glyphicon glyph={'folder-open'} /> <span style={{marginLeft: '5px'}}>Open</span></Button>,
          '   ': <Button style={{fontWeight: 'bold'}} onClick={this.props.syncProject.bind(this, projectPath)}><Glyphicon glyph={'refresh'} /> Sync</Button>
        }
      );
    }
    if (projects.length === 0) return (<p>Click the load button to start checking</p>);
    return projects;
  }

  render() {
    return (
      <div style={{height: '400px', overflowY: 'scroll'}}>
      <Table sortable={true} noDataText="No Recent Projects Found" className="table" id="table" data={this.generateDisplay()}/>
      </div>
    );
  }
}
exports.Component = RecentProjects;
