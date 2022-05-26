import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
// actions
import * as ProjectImportStepperActions from '../../actions/ProjectImportStepperActions';
import * as CopyrightCheckActions from '../../actions/CopyrightCheckActions';
import * as ProjectInformationCheckActions from '../../actions/ProjectInformationCheckActions';
import * as MergeConflictActions from '../../actions/MergeConflictActions';
import * as MissingVersesActions from '../../actions/MissingVersesActions';
import * as ProjectValidationActions from '../../actions/Import/ProjectValidationActions';
// helpers
import * as ProjectInformationCheckHelpers from '../../helpers/ProjectInformationCheckHelpers';
// components
import ProjectValidationStepper from '../../components/projectValidation/ProjectValidationStepper';
import CopyrightCheck from '../../components/projectValidation/CopyrightCheck';
import ProjectInformationCheck from '../../components/projectValidation/ProjectInformationCheck';
import MergeConflictsCheck from '../../components/projectValidation/MergeConflictsCheck';
import MissingVersesCheck from '../../components/projectValidation/MissingVersesCheck';
import ProjectValidationNavigation from '../../components/projectValidation/ProjectValidationNavigation';
import { withLocale } from '../../helpers/localeHelpers';

class ProjectValidationContainer extends Component {
  render() {
    let { stepIndex } = this.props.reducers.projectValidationReducer.stepper;
    const { showProjectValidationStepper } = this.props.reducers.projectValidationReducer;
    const { translate } = this.props;

    const projectValidationContentStyle = {
      opacity: '1',
      width: '90%',
      maxWidth: 'none',
      height: '100%',
      maxHeight: 'none',
      padding: 0,
      top: -30,
    };

    let displayContainer = <div />;

    switch (stepIndex) {
    case 0:
      displayContainer = <CopyrightCheck selectProjectLicense={this.props.actions.selectProjectLicense}
        loadProjectLicenseMarkdownFile={this.props.actions.loadProjectLicenseMarkdownFile}
        {...this.props} />;
      break;
    case 1:
      displayContainer = <ProjectInformationCheck {...this.props} />;
      break;
    case 2:
      displayContainer = <MergeConflictsCheck updateVersionSelection={this.props.actions.updateVersionSelection} {...this.props} />;
      break;
    case 3:
      displayContainer = <MissingVersesCheck toggleNextDisabled={this.props.actions.toggleNextDisabled} {...this.props} />;
      break;
    default:
      break;
    }
    return (
      <MuiThemeProvider>
        <Dialog
          actionsContainerStyle={{ backgroundColor: 'var(--background-color-light)' }}
          actions={<ProjectValidationNavigation translate={translate} />}
          modal={true}
          style={{ padding: '0px' }}
          contentStyle={projectValidationContentStyle}
          bodyStyle={{
            padding: 0, minHeight: '80vh', backgroundColor: 'var(--background-color-light)',
          }}
          open={showProjectValidationStepper}>
          <div style={{ height: '80vh' }}>
            <ProjectValidationStepper translate={translate}
              stepIndex={stepIndex} />
            {displayContainer}
          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  reducers: {
    projectValidationReducer: state.projectValidationReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    copyrightCheckReducer: state.copyrightCheckReducer,
    projectInformationCheckReducer: state.projectInformationCheckReducer,
    mergeConflictReducer: state.mergeConflictReducer,
    missingVersesReducer: state.missingVersesReducer,
    settingsReducer: state.settingsReducer,
  },
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    cancel:() => {
      dispatch(ProjectImportStepperActions.confirmContinueOrCancelImportValidation());
    },
    selectProjectLicense: (selectedLicenseId) => {
      dispatch(CopyrightCheckActions.selectProjectLicense(selectedLicenseId));
    },
    toggleNextDisabled: (isDisabled) => {
      dispatch(ProjectImportStepperActions.toggleNextButton(isDisabled));
    },
    loadProjectLicenseMarkdownFile: (licenseId) => {
      dispatch(CopyrightCheckActions.loadProjectLicenseMarkdownFile(licenseId));
    },
    setBookIDInProjectInformationReducer: (bookId, inStepper) => {
      dispatch(ProjectInformationCheckActions.setBookIDInProjectInformationReducer(bookId, inStepper));
    },
    setResourceIDInProjectInformationReducer: (resourceId) => {
      dispatch(ProjectInformationCheckActions.setResourceIDInProjectInformationReducer(resourceId));
    },
    setNicknameInProjectInformationReducer: (nickname) => {
      dispatch(ProjectInformationCheckActions.setNicknameInProjectInformationReducer(nickname));
    },
    setLanguageIdInProjectInformationReducer: (languageId) => {
      dispatch(ProjectInformationCheckActions.setLanguageIdInProjectInformationReducer(languageId));
    },
    setLanguageNameInProjectInformationReducer: (languageName) => {
      dispatch(ProjectInformationCheckActions.setLanguageNameInProjectInformationReducer(languageName));
    },
    setLanguageDirectionInProjectInformationReducer: (languageDirection) => {
      dispatch(ProjectInformationCheckActions.setLanguageDirectionInProjectInformationReducer(languageDirection));
    },
    setAllLanguageInfoInProjectInformationReducer: (languageId, languageName, languageDirection) => {
      dispatch(ProjectInformationCheckActions.setAllLanguageInfoInProjectInformationReducer(languageId, languageName, languageDirection));
    },
    setContributorsInProjectInformationReducer: (contributors) => {
      dispatch(ProjectInformationCheckActions.setContributorsInProjectInformationReducer(contributors));
    },
    setCheckersInProjectInformationReducer: (checkers) => {
      dispatch(ProjectInformationCheckActions.setCheckersInProjectInformationReducer(checkers));
    },
    updateVersionSelection: (mergeConflictIndex, versionIndex, value) => {
      dispatch(MergeConflictActions.updateVersionSelection(mergeConflictIndex, versionIndex, value));
    },
    updateCheckerName: (checkerName, index) => {
      dispatch(ProjectInformationCheckActions.updateCheckerName(checkerName, index));
    },
    updateContributorName: (contibutorName, index) => {
      dispatch(ProjectInformationCheckActions.updateContributorName(contibutorName, index));
    },
    finalizeCopyrightCheck: () => {
      dispatch(CopyrightCheckActions.finalize());
    },
    finalizeMergeConflictCheck: () => {
      dispatch(MergeConflictActions.finalize());
    },
    finalizeMissingVersesCheck: () => {
      dispatch(MissingVersesActions.finalize());
    },
    finalizeProjectInformationCheck: () => {
      dispatch(ProjectInformationCheckActions.finalize());
    },
    saveAndCloseProjectInformationCheckIfValid: () => {
      dispatch(ProjectInformationCheckActions.saveAndCloseProjectInformationCheckIfValid());
    },
    cancelAndCloseProjectInformationCheck: () => {
      dispatch(ProjectInformationCheckActions.cancelAndCloseProjectInformationCheck());
    },
    getResourceIdWarning: (resourceId) => ProjectInformationCheckHelpers.getResourceIdWarning(resourceId),
    getDuplicateProjectWarning: (resourceId, languageId, bookId, projectSaveLocation) => ProjectInformationCheckHelpers.getDuplicateProjectWarning(resourceId, languageId, bookId, projectSaveLocation),
    displayOverwriteButton: (enable) => {
      dispatch(ProjectValidationActions.displayOverwriteButton(enable));
    },
    updateProjectFont: (projectFont) => {
      dispatch(ProjectInformationCheckActions.setProjectFontInProjectInformationReducer(projectFont));
    },
  },
});

ProjectValidationContainer.propTypes = {
  translate: PropTypes.func,
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.shape({
    projectValidationReducer: PropTypes.shape({
      stepper: PropTypes.shape({ stepIndex: PropTypes.number.isRequired }),
      showProjectValidationStepper:PropTypes.bool.isRequired,
    }),
    mergeConflictReducer: PropTypes.object.isRequired,
    missingVersesReducer: PropTypes.object.isRequired,
    settingsReducer: PropTypes.object.isRequired,
  }),
};

export default withLocale(connect(mapStateToProps, mapDispatchToProps)(ProjectValidationContainer));
