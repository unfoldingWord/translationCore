const React = require('react');
const path = require('path');
const Button = require('react-bootstrap/lib/Button.js');
const api = window.ModuleApi;
const CheckStore = require('../../stores/CheckStore');
const Upload = require('./Upload');

function addToRecent(path) {
  var previousProjects = localStorage.getItem('previousProjects');
  previousProjects = previousProjects ? JSON.parse(previousProjects) : [];
  if (previousProjects.includes(path)) {
    var indexOfProject = previousProjects.indexOf(path);
      previousProjects.splice(indexOfProject, 1);
  }
  previousProjects.push(path);
  localStorage.setItem('previousProjects', JSON.stringify(previousProjects));
}

class RecentProjects extends React.Component {
  getProjects() {
    var projects = JSON.parse(localStorage.getItem('previousProjects'));
    if (projects) return projects.reverse();
    return [];
  }

  loadProject(filePath) {
    this.refs.TargetLanguage.sendFilePath(filePath, null, this.props.onLoad.bind(this));
    api.putDataInCommon('saveLocation', filePath);
  }

  generateDisplay() {
    var projectPaths = this.getProjects();
    var projects = [];
    var i = 0;
    for (var project in projectPaths) {
      var projectPath = projectPaths[project];
      var projectName = path.basename(projectPath);
      projects.push(
        <div key={i++}>
          <span className={'pull-right'}>
            <Button onClick={this.loadProject.bind(this, projectPath)}>Load Project</Button>
          </span>
          <h3>{projectName}</h3>
          <p> Location: {projectPaths[project]}</p>
        </div>
      );
    }
    if (projects.length === 0) return (<p>Click the apps button to start checking</p>);
    return projects;
  }

  render() {
    return (
      <div>
      <Upload ref={"TargetLanguage"} show={false}/>
      {this.generateDisplay()}
      </div>
    );
  }
}
exports.add = addToRecent;
exports.Component = RecentProjects;
