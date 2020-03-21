import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getProjects } from '../../selectors';
// components
import MyProjects from '../../components/home/projectsManagement/MyProjects';
import ProjectInstructions from '../../components/home/projectsManagement/ProjectInstructions';
import ProjectsFAB from '../../components/home/projectsManagement/ProjectsFAB';
import OnlineImportModal from '../../components/home/projectsManagement/OnlineImportModal';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as MyProjectsActions from '../../actions/MyProjects/MyProjectsActions';
import * as ImportOnlineSearchActions from '../../actions/ImportOnlineSearchActions';
import * as OnlineImportWorkflowActions from '../../actions/Import/OnlineImportWorkflowActions';
import * as CSVExportActions from '../../actions/CSVExportActions';
import * as ProjectUploadActions from '../../actions/ProjectUploadActions';
import * as USFMExportActions from '../../actions/USFMExportActions';
import * as OnlineModeConfirmActions from '../../actions/OnlineModeConfirmActions';
import * as ProjectInformationCheckActions from '../../actions/ProjectInformationCheckActions';
import * as LocalImportWorkflowActions from '../../actions/Import/LocalImportWorkflowActions';
import { openProject } from '../../actions/MyProjects/ProjectLoadingActions';
import * as wordAlignmentActions from '../../actions/WordAlignmentActions';

class ProjectsManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.handleProjectSelected = this.handleProjectSelected.bind(this);
  }

  componentWillMount() {
    this.props.actions.getMyProjects();
  }

  /**
   * Handles project selection
   * @param {string} projectName - the name of the project
   */
  handleProjectSelected(projectName) {
    const { openProject } = this.props;
    openProject(projectName);
  }

  render() {
    const { translate, projects } = this.props;
    const {
      importOnlineReducer,
      homeScreenReducer,
      loginReducer,
    } = this.props.reducers;

    return (
      <HomeContainerContentWrapper
        translate={translate}
        instructions={<ProjectInstructions translate={translate}/>}>
        <div style={{ height: '100%' }}>
          <MyProjects
            myProjects={projects}
            translate={translate}
            user={loginReducer.userdata}
            onSelect={this.handleProjectSelected}/>
          <div style={{
            position: 'absolute',
            bottom: '50px',
            right: '50px',
            zIndex: '999',
          }}>
            <ProjectsFAB
              translate={translate}
              homeScreenReducer={this.props.reducers.homeScreenReducer}
              actions={this.props.actions}
            />
          </div>
          <OnlineImportModal
            translate={translate}
            importOnlineReducer={importOnlineReducer}
            homeScreenReducer={homeScreenReducer}
            loginReducer={loginReducer}
            actions={this.props.actions}
          />
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  projects: getProjects(state),
  reducers: {
    importOnlineReducer: state.importOnlineReducer,
    homeScreenReducer: state.homeScreenReducer,
    loginReducer: state.loginReducer,
  },
});

const mapDispatchToProps = (dispatch) => ({
  openProject: (name) => dispatch(openProject(name)),
  selectProject: (projectName) => {
    dispatch(openProject(projectName));
  },
  actions: {
    openProjectsFAB: () => {
      dispatch(BodyUIActions.openProjectsFAB());
    },
    closeProjectsFAB: () => {
      dispatch(BodyUIActions.closeProjectsFAB());
    },
    getMyProjects: () => {
      dispatch(MyProjectsActions.getMyProjects());
    },
    selectProject: (projectName) => {
      dispatch(openProject(projectName));
    },
    selectLocalProject: () => {
      dispatch(LocalImportWorkflowActions.selectLocalProject());
    },
    exportToCSV: (projectPath) => {
      dispatch(CSVExportActions.exportToCSV(projectPath));
    },
    uploadProject: (projectPath, userdata) => {
      dispatch(ProjectUploadActions.uploadProject(projectPath, userdata));
    },
    exportToUSFM: (projectPath) => {
      dispatch(USFMExportActions.exportToUSFM(projectPath));
    },
    closeOnlineImportModal: () => {
      dispatch(BodyUIActions.closeOnlineImportModal());
    },
    openOnlineImportModal: () => {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
        dispatch(BodyUIActions.closeProjectsFAB());
        dispatch(BodyUIActions.openOnlineImportModal());
      }));
    },
    handleURLInputChange: importLink => {
      dispatch(OnlineImportWorkflowActions.getLink(importLink));
    },
    loadProjectFromLink: () => {
      dispatch(OnlineImportWorkflowActions.onlineImport());
    },
    searchReposByUser: (user) => {
      dispatch(ImportOnlineSearchActions.searchReposByUser(user));
    },
    searchReposByQuery: (query) => {
      dispatch(ImportOnlineSearchActions.searchReposByQuery(query));
    },
    openOnlyProjectDetailsScreen: (projectSaveLocation) => {
      dispatch(ProjectInformationCheckActions.openOnlyProjectDetailsScreen(
        projectSaveLocation));
    },
    getUsfm3ExportFile: (projectSaveLocation) => {
      dispatch(wordAlignmentActions.getUsfm3ExportFile(projectSaveLocation));
    },
  },
});

ProjectsManagementContainer.propTypes = {
  projects: PropTypes.array.isRequired,
  reducers: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
  openProject: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectsManagementContainer);
