import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showPopover } from '../actions/PopoverActions';
import { validateSelections } from '../actions/SelectionsActions';
import { setToolSettings } from '../actions/SettingsActions';
import { openIgnorableAlert } from '../actions/AlertActions';
import { updateTargetVerse } from '../actions/VerseEditActions';
import {
  loadResourceArticle,
  makeSureBiblesLoadedForTool,
} from '../actions/ResourcesActions';
import {
  getContext,// TODO: Remove contextIdReducer
  getSelectedToolApi,
  getSelectedToolContainer,
  getProjectSaveLocation,
  getSelectedSourceChapter,
  getSelectedSourceVerse,
  getSelectedTargetChapter,
  getSelectedTargetVerse,
  getSourceBook,
  getSupportingToolApis,
  getTargetBook,
  getUsername,
  getProjects,
  getToolGatewayLanguage,
  getCurrentToolName,
  getProjectBookId,
} from '../selectors';
import ProjectAPI from '../helpers/ProjectAPI';
import CoreAPI from '../helpers/CoreAPI';
import { promptForInvalidCheckFeedback } from '../helpers/FeedbackHelpers';

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

  componentWillReceiveProps(nextProps) {
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
      contextId, // TODO: Remove contextIdReducer
      bookId,
      coreApi,
      username,
      projects,
      projectApi,
      sourceBook,
      targetBook,
      sourceVerse,
      targetChapter,
      sourceChapter,
      targetVerseText,
      currentToolName,
      gatewayLanguage,
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
      gatewayLanguage,

      contextId,// TODO: Remove contextIdReducer

      // project data
      bookId,
      targetVerseText,
      sourceVerse,
      targetChapter,
      sourceChapter,
      targetBook,
      sourceBook,
      currentToolName,

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
  contextId: PropTypes.object, // TODO: Remove contextIdReducer
  toolApi: PropTypes.any,
  sourceVerse: PropTypes.object,
  targetChapter: PropTypes.object,
  sourceChapter: PropTypes.object,
  targetVerseText: PropTypes.string,
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

  return {
    bookId,
    currentToolName,
    gatewayLanguage: getToolGatewayLanguage(state, currentToolName),
    projects: getProjects(state).map(p => new ProjectAPI(p.projectSaveLocation)),
    projectApi: new ProjectAPI(projectPath),
    Tool: getSelectedToolContainer(state),
    supportingToolApis: getSupportingToolApis(state),
    toolApi: getSelectedToolApi(state),
    targetBook: getTargetBook(state),
    sourceBook: getSourceBook(state),
    sourceVerse: getSelectedSourceVerse(state),
    targetVerseText: getSelectedTargetVerse(state),
    sourceChapter: getSelectedSourceChapter(state),
    targetChapter: getSelectedTargetChapter(state),
    contextId: getContext(state), // TODO: Remove contextIdReducer
    projectSaveLocation: projectPath,
    username: getUsername(state),
    loginReducer: state.loginReducer,
    settingsReducer: state.settingsReducer,
    resourcesReducer: state.resourcesReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    contextIdReducer: state.contextIdReducer,// TODO: Remove once #6651, #6652 & #6654 are implemented in wA tool.
    groupsIndexReducer: state.groupsIndexReducer,// TODO: Remove once #6651, #6652 & #6654 are implemented in wA tool.
    groupsDataReducer: state.groupsDataReducer,// TODO: Remove once #6651, #6652 & #6654 are implemented in wA tool.
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
  onInvalidCheck(contextId, selectedGL, moveToNext) {
    dispatch(promptForInvalidCheckFeedback(contextId, selectedGL, moveToNext));
  },
  validateSelections: (targetVerse) => {
    dispatch(validateSelections(targetVerse));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolContainer);
