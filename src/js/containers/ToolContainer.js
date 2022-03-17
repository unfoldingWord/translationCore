import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showPopover } from '../actions/PopoverActions';
import { setToolSettings } from '../actions/SettingsActions';
import { openIgnorableAlert } from '../actions/AlertActions';
import {
  loadLexiconEntry,
  updateTargetVerse,
  loadResourceArticle,
  makeSureBiblesLoadedForTool,
} from '../actions/ResourcesActions';
import {
  getSelectedToolApi,
  getSelectedToolContainer,
  getProjectSaveLocation,
  getSourceBook,
  getSupportingToolApis,
  getTargetBook,
  getUsername,
  getProjects,
  getToolGatewayLanguage,
  getCurrentToolName,
  getProjectBookId,
  getToolGlOwner,
} from '../selectors';
import ProjectAPI from '../helpers/ProjectAPI';
import CoreAPI from '../helpers/CoreAPI';
import { promptForInvalidCheckFeedback } from '../helpers/FeedbackHelpers';
import complexScriptFonts from '../common/complexScriptFonts';
import { addObjectPropertyToManifest } from '../actions/ProjectDetailsActions';

const styles = {
  container: {
    display: 'flex', flex: 'auto', height: 'calc(100vh - 30px)',
  },
  innerDiv: { flex: 'auto', display: 'flex' },
};

class ToolContainer extends Component {
  constructor(props) {
    super(props);
    this.makeToolProps = this.makeToolProps.bind(this);
    this.legacyToolsReducer = this.legacyToolsReducer.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { toolApi, supportingToolApis } = nextProps;

    // update api props
    const toolProps = this.makeToolProps(nextProps);

    for (const key of Object.keys(supportingToolApis)) {
      supportingToolApis[key].triggerWillReceiveProps(toolProps);
    }

    if (toolApi) {
      const activeToolProps = {
        ...toolProps,
        tools: supportingToolApis,
      };
      toolApi.triggerWillReceiveProps(activeToolProps);
    }
  }

  /**
   * Builds the tC api for use in the tool
   * @param {object} [nextProps] - the component props. If empty the current props will be used.
   * @return {object}
   */
  makeToolProps(nextProps = undefined) {
    if (!nextProps) {
      nextProps = this.props;
    }

    const {
      bookId,
      coreApi,
      username,
      projects,
      projectApi,
      sourceBook,
      targetBook,
      currentToolName,
      gatewayLanguageCode,
      gatewayLanguageOwner,
      currentLanguage: { code },
    } = nextProps;

    return {
      // project api
      project: projectApi,

      // flattened project api methods that may be deprecated in the future.
      readProjectDataDir: projectApi.readDataDir,
      readProjectDataDirSync: projectApi.readDataDirSync,
      writeProjectData: projectApi.writeDataFile,
      writeProjectDataSync: projectApi.writeDataFileSync,
      readProjectData: projectApi.readDataFile,
      readProjectDataSync: projectApi.readDataFileSync,
      projectDataPathExists: projectApi.dataPathExists,
      projectDataPathExistsSync: projectApi.dataPathExistsSync,
      deleteProjectFile: projectApi.deleteDataFile,

      // tC api
      showAlert: coreApi.showAlert,
      showDialog: coreApi.showDialog,
      showLoading: coreApi.showLoading,
      closeLoading: coreApi.closeLoading,
      showIgnorableAlert: coreApi.showIgnorableAlert,
      closeAlert: coreApi.closeAlert,
      appLanguage: code,
      projects,
      username,
      gatewayLanguageCode,
      gatewayLanguageOwner,

      // project data
      bookId,
      targetBook,
      sourceBook,
      currentToolName,
      toolName: currentToolName,
      complexScriptFonts,

      // deprecated props
      showIgnorableDialog: (...args) => {
        console.warn('DEPRECATED: showIgnorableDialog is deprecated. Use showIgnorableAlert instead');
        return coreApi.showIgnorableAlert(...args);
      },
    };
  }

  /**
   * Builds a legacy tool reducer for tW.
   * This is a temporary hack
   */
  legacyToolsReducer() {
    const { currentToolName, supportingToolApis } = this.props;
    return {
      currentToolName,
      apis: supportingToolApis,
    };
  }

  render() {
    const {
      Tool,
      supportingToolApis,
    } = this.props;

    const props = { ...this.props };

    delete props.translate;
    delete props.openIgnorableAlert;
    delete props.coreApi;

    const activeToolProps = {
      ...this.makeToolProps(),
      tools: supportingToolApis,
    };

    return (
      <div style={styles.container}>
        <div style={styles.innerDiv}>
          <Tool
            {...props}
            {...activeToolProps}
          />
        </div>
      </div>
    );
  }
}

ToolContainer.propTypes = {
  Tool: PropTypes.any,
  toolApi: PropTypes.any,
  targetBook: PropTypes.object,
  sourceBook: PropTypes.object,
  projects: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
  currentLanguage: PropTypes.object.isRequired,
  openIgnorableAlert: PropTypes.func.isRequired,
  currentToolName: PropTypes.string.isRequired,
  supportingToolApis: PropTypes.object.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
};

ToolContainer.contextTypes = { store: PropTypes.any };

const mapStateToProps = state => {
  const projectPath = getProjectSaveLocation(state);
  const currentToolName = getCurrentToolName(state);
  const bookId = getProjectBookId(state);
  const gatewayLanguageCode = getToolGatewayLanguage(state, currentToolName);
  const gatewayLanguageOwner = getToolGlOwner(state, currentToolName);

  return {
    bookId,
    currentToolName,
    gatewayLanguageCode,
    gatewayLanguageOwner,
    projects: getProjects(state).map(p => new ProjectAPI(p.projectSaveLocation)),
    projectApi: new ProjectAPI(projectPath),
    Tool: getSelectedToolContainer(state),
    supportingToolApis: getSupportingToolApis(state),
    toolApi: getSelectedToolApi(state),
    targetBook: getTargetBook(state),
    sourceBook: getSourceBook(state),
    projectSaveLocation: projectPath,
    username: getUsername(state),
    loginReducer: state.loginReducer,
    settingsReducer: state.settingsReducer,
    resourcesReducer: state.resourcesReducer,
    projectDetailsReducer: state.projectDetailsReducer,
  };
};

const mapDispatchToProps = (dispatch) => ({
  coreApi: new CoreAPI(dispatch),
  openIgnorableAlert: (id, message, ignorable) => {
    dispatch(openIgnorableAlert(id, message, ignorable));
  },
  makeSureBiblesLoadedForTool: (contextId) => {
    dispatch(makeSureBiblesLoadedForTool(contextId));
  },
  loadResourceArticle(resourceType, articleId, languageId, category, async) {
    dispatch(loadResourceArticle(resourceType, articleId, languageId, category, async));
  },
  updateTargetVerse(chapter, verse, text) {
    dispatch(updateTargetVerse(chapter, verse, text));
  },
  setToolSettings(NAMESPACE, settingsPropertyName, toolSettingsData) {
    dispatch(setToolSettings(NAMESPACE, settingsPropertyName, toolSettingsData));
  },
  showPopover(title, bodyText, positionCoord) {
    dispatch(showPopover(title, bodyText, positionCoord));
  },
  onInvalidCheck(contextId, selectedGL, moveToNext, changeToNextContextId) {
    dispatch(promptForInvalidCheckFeedback(contextId, selectedGL, moveToNext, changeToNextContextId));
  },
  loadLexiconEntry(lexiconId, entryId) {
    dispatch(loadLexiconEntry(lexiconId, entryId));
  },
  addObjectPropertyToManifest(propertyName, value) {
    dispatch(addObjectPropertyToManifest(propertyName, value));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolContainer);
