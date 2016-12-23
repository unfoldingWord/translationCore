const React = require('react');

const Gogs = require('./GogsApi.js')();
const api = window.ModuleApi;
const loadOnline = require('../LoadOnline.js');
const Upload = require('../UploadMethods.js');
const Button = require('react-bootstrap/lib/Button.js');
const CoreActions = require('../../../actions/CoreActions.js');

class Projects extends React.Component {
  constructor() {
    super();
    this.state = {repos: []};
  }

  componentWillMount() {
    this.updateRepos();
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
    var _this = this;
    loadOnline(link, function(err, savePath, url) {
      if (err) {
        console.error(err);
      } else {
        Upload.sendFilePath(savePath, url)
        CoreActions.showCreateProject("");
      }
    });
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
        {projectList}
      </div>
    );
  }
}

module.exports = Projects;
