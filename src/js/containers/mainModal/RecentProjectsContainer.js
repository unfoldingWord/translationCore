import React from 'react';
import { connect } from 'react-redux';
import path from 'path-extra';
import fs from 'fs-extra';
import { Glyphicon } from 'react-bootstrap/lib';
// components
import RecentProjects from '../../components/RecentProjects';
// actions
import * as ProjectUploadActions from '../../actions/ProjectUploadActions';
import * as CSVExportActions from '../../actions/CSVExportActions';
import * as RecentProjectsActions from '../../actions/RecentProjectsActions';
import * as ModalActions from '../../actions/ModalActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as ProjectSelectionActions from '../../actions/ProjectSelectionActions';
// constant declaration
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore', 'projects');


class RecentProjectsContainer extends React.Component {

  componentWillMount() {
    this.props.getProjectsFromFolder();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.modalReducer.currentSection === 1 && newProps.modalReducer.currentTab === 2 && (newProps.modalReducer.currentTab !== this.props.modalReducer.currentTab || newProps.modalReducer.currentSection !== this.props.modalReducer.currentSection)) {
      this.props.getProjectsFromFolder();
    }
  }

  generateButton(projectPath, currentPath) {
    return (
      <span>
        <button className="btn-prime"
          style={{width: "100px", margin: "10px 5px 10px 0"}}
          disabled={projectPath === currentPath}
          onClick={() => this.props.selectProject(projectPath, this.props.loggedInUser)}
        >
          <Glyphicon glyph={'folder-open'} />
          <span style={{ marginLeft: '10px' }}>Select</span>
        </button>
        <button className="btn-second"
          style={{width: "120px", margin: "10px 5px 10px 0"}}
          onClick={()=> this.props.exportToCSV(projectPath)}
        >
          <Glyphicon glyph={'download'} />
          <span style={{ marginLeft: '5px' }}>Export (csv)</span>
        </button>
        <button className="btn-second"
          style={{width: "100px", margin: "10px 0"}}
          onClick={() => this.props.uploadProject(projectPath, this.props.userdata)}
        >
          <Glyphicon glyph={'upload'} />
          <span style={{ marginLeft: '5px' }}>Upload</span>
        </button>
      </span>
    );
  }

  getRecentProjects() {
    let projectPaths = this.props.recentProjects;
    let { projectSaveLocation } = this.props;
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
        manifest = { target_language: {}, project: {} }
      }
      let stats;
      try {
        stats = fs.statSync(projectPath);
      } catch (e) {
        continue;
      }
      let mtime = new Date(stats.mtime);
      let difference = mtime.getMonth() + 1 + '/' + mtime.getDate() + '/' + mtime.getFullYear();
      let buttonSpan = (this.generateButton(projectPath, projectSaveLocation));
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
      <div style={{ backgroundColor: "var(--reverse-color)" }}>
        <RecentProjects.Component data={recentProjectsData} />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    ...state.recentProjectsReducer,
    manifest: state.projectDetailsReducer.manifest,
    loggedInUser: state.loginReducer.loggedInUser,
    userdata: state.loginReducer.userdata,
    modalReducer: state.modalReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    selectProject: (projectPath, loggedInUser) => {
      if (!loggedInUser) {
        dispatch(ModalActions.selectModalTab(1, 1, true));
        dispatch(AlertModalActions.openAlertDialog("Please log in before loading a project"));
        return;
      }
      dispatch(ProjectSelectionActions.selectProject(projectPath));
    },
    uploadProject: (projectPath, user) => {
      if(user.localUser){
        dispatch(AlertModalActions.openAlertDialog("Please log in to Door43 to upload your projects"))
      } else {
        dispatch(ProjectUploadActions.uploadProject(projectPath, user));
      }
    },
    getProjectsFromFolder: () => {
      dispatch(RecentProjectsActions.getProjectsFromFolder());
    },
    exportToCSV: (projectPath) => {
      dispatch(CSVExportActions.exportToCSV(projectPath));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecentProjectsContainer);
