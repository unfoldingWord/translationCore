const React = require('react');
const { connect  } = require('react-redux');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const api = window.ModuleApi;
const RecentProjects = require('../components/core/RecentProjects');
const DragDrop = require('../components/core/DragDrop');
const OnlineInput = require('../components/core/OnlineInput');
const Projects = require('../components/core/login/Projects');
const { Tabs, Tab } = require('react-bootstrap/lib');
const dragDropActions = require('../actions/DragDropActions.js');
const recentProjectActions = require('../actions/RecentProjectsActions.js');
const path = require('path-extra');
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
const fs = require(window.__base + 'node_modules/fs-extra');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');

class LoadModalContainer extends React.Component {
  generateButton(projectPath) {
    return (
      <span>
        <Button style={{ backgroundColor: '#C3105A', borderWidth: '0px', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom,#C3105A 0,#C3105A 100%)', color: 'white' }} onClick={() => this.props.onLoad(projectPath)}>
          <Glyphicon glyph={'folder-open'} />
          <span style={{ marginLeft: '10px', marginRight: '20px' }}>Open</span>
        </Button>
        <Button style={{ fontWeight: 'bold', borderWidth: '0px', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom, white 0, white 100%)', backgroundColor: 'white' }} onClick={() => this.props.syncProject(projectPath)}>
          <Glyphicon glyph={'refresh'} />
          <span style={{ marginLeft: '5px' }}> Sync </span>
        </Button>
      </span>
    )
  }
  getRecentProjects() {
    var projectPaths = this.props.recentProjects;
    var projects = [];
    for (var project in projectPaths) {
      var projectPath = path.join(DEFAULT_SAVE, projectPaths[project]);
      var projectName = projectPaths[project];
      if (projectName === '.DS_Store' || projectName === '.git') continue;
      var manifestLocation = path.join(projectPath, 'manifest.json');
      var manifest = {};
      try {
        manifest = require(manifestLocation);
      } catch (err) {
        // Happens with USFM projects
        manifest = { target_language: {}, project: {} }
      }
      var stats = fs.statSync(projectPath);
      var mtime = new Date(stats.mtime);
      var difference = mtime.getMonth() + 1 + '/' + mtime.getDate() + '/' + mtime.getFullYear();
      var buttonSpan = (this.generateButton(projectPath));
      projects.push(
        {
          '': <Glyphicon glyph={'folder-open'} />,
          'Project Name': projectName,
          'Book': manifest.project.name || 'Unknown',
          'Language': manifest.target_language.name || 'Unknown',
          'Date Updated': difference,
          ' ': buttonSpan
        }
      );
    }
    if (projects.length === 0) return null;
    return projects;
  }
  render() {
    var projects = <Projects {...this.props.profileProjectsProps} updateRepos={() => { } } makeList={() => { } } />
    var recentProjectsData = this.getRecentProjects();
    var loadOnline = (
      <div style={{ padding: '10% 0' }}>
        <center>
          <Button onClick={this.props.showD43} style={{ width: '60%', fontWeight: 'bold', fontSize: '20px' }} bsStyle='primary' bsSize='large'>
            <img src="images/D43.svg" width="90" style={{ marginRight: '25px', padding: '10px' }} />
            Browse Door43 Projects
            </Button>
          <div style={{ width: '60%', height: '20px', borderBottom: '2px solid white', textAlign: 'center', margin: '20px 0' }}>
            <span style={{ fontSize: '20px', backgroundColor: '#333', fontWeight: 'bold', padding: '0 40px' }}>
              or
              </span>
          </div>
          <OnlineInput onChange={this.props.handleOnlineChange} load={() => { this.props.onClick(this.props.show) } } />
        </center>
      </div>
    );
    var onlineView = (this.props.showOnline) ? loadOnline : projects;
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
          bsStyle="pills"
          style={{ borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%" }}>
          <Tab eventKey={1} title="My Projects" style={{ backgroundColor: "#333333" }}>
            <RecentProjects.Component data={recentProjectsData} />
          </Tab>
          <Tab eventKey={2} title="Import Local Project" style={{ backgroundColor: "#333333" }}>
            <DragDrop {...this.props} />
          </Tab>
          <Tab eventKey={3} title="Import Online Project" style={{ backgroundColor: "#333333" }}>
            {onlineView}
          </Tab>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.dragDropReducer, state.recentProjectsReducer);
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    dragDropOnClick: (open, properties) => {
      dispatch(dragDropActions.onClick(open, properties));
    },
    onLoad: (projectPath) => {
      dispatch(recentProjectActions.onLoad(projectPath));
    },
    syncProject: (projectPath) => {
      dispatch(recentProjectActions.syncProject(projectPath));
    },
    loadProject: () => {
      dispatch(recentProjectActions.startLoadingNewProject());
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(LoadModalContainer);
