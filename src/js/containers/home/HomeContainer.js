import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { getBuild } from 'tc-electron-env';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import WelcomeSplash from '../../components/home/WelcomeSplash';
import LicenseModal from '../../components/home/license/LicenseModal';
import AppVersion from '../../components/home/AppVersion';
import HomeStepper from '../../components/home/Stepper';
import Overview from '../../components/home/overview';
import HomeScreenNavigation from '../../components/home/HomeScreenNavigation';
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as CSVExportActions from '../../actions/CSVExportActions';
import * as ProjectUploadActions from '../../actions/ProjectUploadActions';
import * as USFMExportActions from '../../actions/USFMExportActions';
import * as ProjectInformationCheckActions from '../../actions/ProjectInformationCheckActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';
import { openTool, warnOnInvalidations } from '../../actions/ToolActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
// constants
import { APP_VERSION } from '../../common/constants';
// containers
import ToolsManagementContainer from './ToolsManagementContainer';
import ProjectsManagementContainer from './ProjectsManagementContainer';
import UsersManagementContainer from './UsersManagementContainer';

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategoriesChanged: false,
      glSelectedChanged: false,
    };
  }

  componentDidUpdate(prevProps) {
    const {
      toolsReducer: { selectedTool },
      projectDetailsReducer: {
        toolsCategories,
        manifest: { toolsSelectedGLs = {} },
      },
    } = this.props.reducers;
    const {
      projectDetailsReducer: {
        toolsCategories: prevToolsCategories,
        manifest: { toolsSelectedGLs: prevToolsSelectedGLs = {} },
      },
    } = prevProps.reducers;

    const currentSelectedGL = toolsSelectedGLs[selectedTool];
    const prevCurrentSelectedGL = prevToolsSelectedGLs[selectedTool];
    const glSelectedChanged = currentSelectedGL && prevCurrentSelectedGL !== currentSelectedGL;

    if (glSelectedChanged) {
      this.setState({ glSelectedChanged });
    }

    if (!_.isEqual(prevToolsCategories[selectedTool], toolsCategories[selectedTool])) {
      this.setState({ selectedCategoriesChanged: true });
    }
  }

  render() {
    const {
      homeScreenReducer: {
        stepper: { stepIndex },
        showWelcomeSplash,
        showLicenseModal,
      },
    } = this.props.reducers;

    let displayContainer = <div />;

    switch (stepIndex) {
    case 0:
      displayContainer = (
        <Overview
          {...this.props}
          selectedCategoriesChanged={this.state.selectedCategoriesChanged}
          glSelectedChanged={this.state.glSelectedChanged}
        />
      );
      break;
    case 1:
      displayContainer = <UsersManagementContainer {...this.props}/>;
      break;
    case 2:
      displayContainer = <ProjectsManagementContainer {...this.props} />;
      break;
    case 3:
      displayContainer = <ToolsManagementContainer {...this.props} />;
      break;
    default:
      break;
    }

    const { translate } = this.props;
    const { toggleWelcomeSplash } = this.props.actions;

    return (
      <div style={{ width: '100%' }}>
        {showWelcomeSplash ?
          <WelcomeSplash
            toggleWelcomeSplash={toggleWelcomeSplash}
            translate={translate}
          />
          :
          <MuiThemeProvider style={{ fontSize: '1.1em' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', background: 'var(--background-color-light)',
            }}>
              <HomeStepper translate={translate}/>
              {displayContainer}
              <div style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'center',
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <HomeScreenNavigation translate={translate} {...this.props} />
                  <AppVersion actions={this.props.actions} version={`${APP_VERSION} (${getBuild()})`} />
                </div>
              </div>
            </div>
          </MuiThemeProvider>
        }
        <LicenseModal
          translate={translate}
          version={`${APP_VERSION} (${getBuild()})`}
          actions={this.props.actions}
          showLicenseModal={showLicenseModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  reducers: {
    homeScreenReducer: state.homeScreenReducer,
    loginReducer: state.loginReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    toolsReducer: state.toolsReducer,
    localeSettings: state.localeSettings,
  },
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    openTool: name => dispatch(openTool(name)),
    toggleWelcomeSplash: () => {
      dispatch(BodyUIActions.toggleWelcomeSplash());
    },
    closeLicenseModal: () => {
      dispatch(BodyUIActions.closeLicenseModal());
    },
    goToNextStep: () => {
      dispatch(BodyUIActions.goToNextStep());
    },
    goToPrevStep: () => {
      dispatch(BodyUIActions.goToPrevStep());
    },
    goToStep: (stepNumber) => {
      dispatch(BodyUIActions.goToStep(stepNumber));
    },
    toggleHomeView: (value) => {
      dispatch(BodyUIActions.toggleHomeView(value));
    },
    openLicenseModal: () => {
      dispatch(BodyUIActions.openLicenseModal());
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
    openOnlyProjectDetailsScreen: (projectSaveLocation) => {
      dispatch(ProjectInformationCheckActions.openOnlyProjectDetailsScreen(projectSaveLocation));
    },
    // openLocaleScreen: () => {
    //   dispatch(LocaleActions.openLocaleScreen());
    // },
    // closeLocaleScreen: () => {
    //   dispatch(LocaleActions.closeLocaleScreen());
    // },
    getProjectProgressForTools: (toolName) => {
      dispatch(ProjectDetailsActions.getProjectProgressForTools(toolName));
    },
    warnOnInvalidations: (toolName) => {
      dispatch(warnOnInvalidations(toolName));
    },
    openAlertDialog: (message, loading) => {
      dispatch(AlertModalActions.openAlertDialog(message, loading));
    },
    openOptionDialog: (...args) => dispatch(AlertModalActions.openOptionDialog(...args)),
    closeAlertDialog: () => dispatch(AlertModalActions.closeAlertDialog()),
  },
});

HomeContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired,
  currentLanguage: PropTypes.object.isRequired,
  translate: PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeContainer);
