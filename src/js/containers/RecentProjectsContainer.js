import React from 'react';
import { connect } from 'react-redux';
import path from 'path-extra';
import fs from 'fs-extra';
import { Modal, Tabs, Tab, Button, Glyphicon } from 'react-bootstrap/lib';
// components
import RecentProjects from '../components/core/RecentProjects';
// actions
import * as recentProjectsActions from '../actions/RecentProjectsActions.js';
import { selectModalTab } from '../actions/ModalActions.js';
import { showNotification } from '../actions/NotificationActions.js';
import { openProject } from '../actions/getDataActions.js'; 
// constant declaration
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');


class RecentProjectsContainer extends React.Component {

  componentWillMount() {
    this.props.getProjectsFromFolder()
  }

  generateButton(projectPath) {
    return (
        <span>
            <Button style={{ width: "90px", padding: "5px", backgroundColor: 'var(--accent-color-dark)', border: '2px solid var(--accent-color-dark)', margin: '10px 5px 10px 0', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom,var(--accent-color-dark) 0,var(--accent-color-dark) 100%)', color: 'var(--reverse-color)' }} onClick={() => this.props.onLoad(projectPath, this.props.loggedInUser)}>
                <Glyphicon glyph={'folder-open'} />
                <span style={{ marginLeft: '10px' }}>Select</span>
            </Button>
            <Button style={{ width: "120px", padding: "5px", fontWeight: 'bold', border: '2px solid var(--accent-color-dark)', margin: '10px 5px 10px 0', color: 'var(--accent-color-dark)', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom,var(--reverse-color) 0,var(--reverse-color) 100%)', backgroundColor: 'var(--reverse-color)' }}>
                <Glyphicon glyph={'download'} />
                <span style={{ marginLeft: '5px' }}>Export (csv)</span>
            </Button>
            <Button style={{ width: "90px", padding: "5px", fontWeight: 'bold', border: '2px solid var(--accent-color-dark)', margin: '10px 0', color: 'var(--accent-color-dark)', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom,var(--reverse-color) 0,var(--reverse-color) 100%)', backgroundColor: 'var(--reverse-color)' }} onClick={() => this.props.syncProject(projectPath, this.props.manifest, this.props.userdata)}>
                <Glyphicon glyph={'upload'} />
                <span style={{ marginLeft: '5px' }}>Upload</span>
            </Button>
        </span>
    )
  }

  getRecentProjects() {
    let projectPaths = this.props.recentProjects;
    let projects = [];
    for (let project in projectPaths) {
      let projectPath = path.join(DEFAULT_SAVE, projectPaths[project]);
      let projectName = projectPaths[project];
      if (projectName === '.DS_Store' || projectName === '.git') continue;
      let manifestLocation = path.join(projectPath, 'manifest.json');
      let manifest = {};
      try {
        manifest = require(manifestLocation);
      } catch (err) {
        // Happens with USFM projects
        manifest = { target_language: {}, ts_project: {} }
      }
      let stats;
      try {
        stats = fs.statSync(projectPath);
      } catch (e) {
        continue;
      }
      let mtime = new Date(stats.mtime);
      let difference = mtime.getMonth() + 1 + '/' + mtime.getDate() + '/' + mtime.getFullYear();
      let buttonSpan = (this.generateButton(projectPath));
      projects.push(
        {
          '':
          <Glyphicon glyph={'folder-open'} />,
          'Project Name': projectName,
          'Book': manifest.project ? manifest.project.name : 'Unknown',
          'Language': manifest.target_language ? manifest.target_language.name : 'Unknown',
          'Date Updated': difference,
          ' ': buttonSpan
        }
      );
    }
    if (projects.length === 0) return null;
    return projects;
  }

  render() {
    let recentProjectsData = this.getRecentProjects();

    return (
      <div>
        <RecentProjects.Component data={recentProjectsData} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.recentProjectsReducer,
    manifest: state.projectDetailsReducer.manifest,
    loggedInUser: state.loginReducer.loggedInUser,
    userdata: state.loginReducer.userdata,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: (projectPath, loggedInUser) => {
      if (!loggedInUser) {
        dispatch(selectModalTab(1, 1, true));
        dispatch(showNotification("Please login before loading a project", 5));
        return;
      }
      dispatch(openProject(projectPath));
    },
    syncProject: (projectPath, manifest, user) => {
      dispatch(recentProjectsActions.syncProject(projectPath, manifest, user));
    },
    loadProject: () => {
      dispatch(recentProjectsActions.startLoadingNewProject());
    },
    getProjectsFromFolder: () => {
      dispatch(recentProjectsActions.getProjectsFromFolder());
    },
    exportToCSV: (projectPath) => {
      dispatch(recentProjectsActions.exportToCSV(projectPath));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecentProjectsContainer);
