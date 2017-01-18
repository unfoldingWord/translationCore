const React = require('react');
const path = require('path-extra');
const Button = require('react-bootstrap/lib/Button.js');
const defaultSave = path.join(path.homedir(), 'translationCore');

class RecentProjects extends React.Component {
  generateDisplay() {
    var projectPaths = this.props.projects;
    var projects = [];
    for (var project in projectPaths) {
      var projectPath = path.join(defaultSave, projectPaths[project]);
      var projectName = projectPaths[project];
      if (projectName === '.DS_Store' || projectName === '.git') continue;
      projects.push(
        <div key={project}>
          <span className={'pull-right'}>
            <Button onClick={()=>this.props.onLoad(projectPath)}>Load Project</Button>
          </span>
          <h3>{projectName}</h3>
          <p> Location:
            <a onClick={this.props.showFolder.bind(this, projectPath)}
               style={{cursor: 'pointer'}}>
              {' ' + projectPath}
            </a>
          </p>
        </div>
      );
    }
    if (projects.length === 0) return (<p>Click the load button to start checking</p>);
    return projects;
  }

  render() {
    return (
      <div>
      {this.generateDisplay()}
      </div>
    );
  }
}
exports.Component = RecentProjects;
