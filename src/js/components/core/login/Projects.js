const React = require('react');

const Gogs = require('./GogsApi.js')();
const api = window.ModuleApi;
const loadOnline = require('../LoadOnline.js');
const Upload = require('../Upload.js');
const Button = require('react-bootstrap/lib/Button.js');

class Projects extends React.Component {
  constructor() {
    super();
    this.state = {repos: []};
  }

  updateRepos() {
    var user = api.getLoggedInUser();
    if (user) {
      var _this = this;
      return Gogs.retrieveRepos(user.userName).then(function(repos){
        _this.setState({repos});
      });
    }
  }

  openSelected(projectPath) {
    var link = 'https://git.door43.org/' + projectPath + '.git';
    loadOnline(link, this.refs.Upload.sendFilePath);
  }

  render() {
    var user = api.getLoggedInUser();
    if (!user) {
      return (
      <div>
        <center>
        <br />
        <h4>
        Please login first
        </h4>
        <br />
        </center>
      </div>
    )
    }
    this.updateRepos();
    var projectArray = this.state.repos;
    var projectList = []
    for (var p in projectArray) {
      var projectName = projectArray[p].project;
      var repoName = projectArray[p].repo;
      var showBack = this.props.back ? 'inline' : 'none';
      projectList.push(
        <div key={p} style={{width: '100%', marginBottom: '15px'}}>
          {projectName}
          <Button bsStyle='primary' className={'pull-right'} bsSize='sm' onClick={this.openSelected.bind(this, repoName)}>Load Project</Button>
         </div>
      );
    }
    if (projectList.length === 0) {
      projectList.push(
        <div key={'None'} style={{width: '100%', marginBottom: '15px'}}>
          No Projects Found
        </div>
       );
    }

    return (
      <div style={{height: '419px', overflowY: 'auto'}}>
        <div style={{marginBottom: '15px'}}>
          <span style={{fontSize: '20px'}}>Your Door43 Projects</span>
          <Button bsStyle='primary' style={{display: showBack}} onClick={this.props.back} className={'pull-right'} bsSize='sm'>Back to profile</Button>
        </div>
        <Upload ref={'Upload'} show={false} />
        {projectList}
      </div>
    );
  }
}

module.exports = Projects;
