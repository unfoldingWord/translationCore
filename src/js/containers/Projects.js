const React = require('react');
const Projects = require('../components/core/login/Projects.js');
const Gogs = require('../components/core/login/GogsApi.js')();
const Button = require('react-bootstrap/lib/Button.js');
const loadOnline = require('../components/core/LoadOnline.js');
const Upload = require('../components/core/UploadMethods.js');
const CoreActions = require('../actions/CoreActions.js');



class ProjectsContainer extends React.Component {
  constructor() {
    super();
    this.state = {repos: []}
  }

  componentWillMount() {
    this.updateRepos();
    this.showBack = this.props.back ? 'inline' : 'none';
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

  makeList() {
    var user = api.getLoggedInUser();
    if (!user) {
      return (
      <div>
        <center>
        <br />
        <h4> Please login first </h4>
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
    return projectList;
  }

  render() {
   return (<Projects {...this.props} showBack={this.showBack}>
        {this.makeList()}
      </Projects>)
  }
}

module.exports = ProjectsContainer;
