import React from 'react';
import { connect } from 'react-redux';
import path from 'path-extra';
import fs from 'fs-extra';
import { Modal, Tabs, Tab, Button, Glyphicon } from 'react-bootstrap/lib';
// components
import RecentProjects from '../components/core/RecentProjects';
// actions
import * as recentProjectsActions from '../actions/RecentProjectsActions.js';
// constant declaration
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');


class RecentProjectsContainer extends React.Component {

  componentWillMount() {
    this.props.getProjectsFromFolder()
  }

  generateButton(projectPath) {
    return (
        <span>
            <Button style={{ width: "50%", backgroundColor: '#C3105A', borderWidth: '0px', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom,#C3105A 0,#C3105A 100%)', color: 'white' }} onClick={() => this.props.onLoad(projectPath)}>
                <Glyphicon glyph={'folder-open'} />
                <span style={{ marginLeft: '10px', marginRight: '20px' }}>Select</span>
            </Button>
            <Button style={{ width: "50%", fontWeight: 'bold', borderWidth: '0px', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom, white 0, white 100%)', backgroundColor: 'white' }} onClick={() => this.props.syncProject(projectPath, this.props.manifest)}>
                <Glyphicon glyph={'refresh'} />
                <span style={{ marginLeft: '5px' }}> Sync </span>
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
          '': <Glyphicon glyph={'folder-open'} />,
          'Project Name': projectName,
          'Book': manifest.ts_project ? manifest.ts_project.name : 'Unknown',
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
    manifest: state.projectDetailsReducer.manifest
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: projectPath => {
      dispatch(recentProjectsActions.onLoad(projectPath));
    },
    syncProject: (projectPath, manifest) => {
      dispatch(recentProjectsActions.syncProject(projectPath, manifest));
    },
    loadProject: () => {
      dispatch(recentProjectsActions.startLoadingNewProject());
    },
    getProjectsFromFolder: () => {
      dispatch(recentProjectsActions.getProjectsFromFolder());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecentProjectsContainer);
