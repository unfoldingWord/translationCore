const React = require('react');

const Gogs = require('./GogsApi.js')();
const api = window.ModuleApi;
const loadOnline = require('../LoadOnline.js');
const Upload = require('../Upload.js');
const Button = require('react-bootstrap/lib/Button.js');

class Projects extends React.Component {
  constructor() {
    super();
    this.state = {repos: null};
  }

  updateRepos() {
    var user = api.getLoggedInUser();
    if (user) {

    }
    var _this = this;
    return Gogs.retrieveRepos('royalsix').then(function(repos){
        _this.setState({repos});
    });
  }

  openSelected(projectPath) {
    var link = 'https://git.door43.org/' + projectPath + '.git';
    loadOnline(link, this.refs.Upload.sendFilePath);
  }

  render() {
    this.updateRepos();
    var projectArray = this.state.repos;
    var projectList = []
    for (var p in projectArray) {
      var projectName = projectArray[p].project;
      var repoName = projectArray[p].repo;
      projectList.push(
        <div key={p}>
          {projectName} &nbsp
          <Button bsStyle='primary' bsSize='sm' onClick={this.openSelected.bind(this, repoName)}>Load Project</Button>
         </div>
      );
    }

    return (
      <div>
        <Upload ref={'Upload'} show={false} />
        {projectList}
      </div>
    );
  }
}

module.exports = Projects;
