import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { VerseObjectUtils } from 'word-aligner';
import { showPopover } from '../actions/PopoverActions';
import { addComment } from '../actions/CommentsActions';
import { editTargetVerse } from '../actions/VerseEditActions';
import { toggleReminder } from '../actions/RemindersActions';
import {
  changeSelections, getSelectionsFromContextId, validateSelections,
} from '../actions/SelectionsActions';
import {
  changeCurrentContextId, changeToNextContextId, changeToPreviousContextId, loadCurrentContextId,
} from '../actions/ContextIdActions';
import { addGroupData } from '../actions/GroupsDataActions';
import { loadGroupsIndex, updateRefreshCount } from '../actions/GroupsIndexActions';
import { setToolSettings } from '../actions/SettingsActions';
import {
  closeAlertDialog, openAlertDialog, openOptionDialog,
} from '../actions/AlertModalActions';
import { closeAlert, openIgnorableAlert } from '../actions/AlertActions';
import { selectModalTab } from '../actions/ModalActions';
import * as ResourcesActions from '../actions/ResourcesActions';
import {
  changeGroup, expandSubMenu, setFilter,
} from '../actions/GroupMenuActions.js';
//helpers
import { getAvailableScripturePaneSelections, getGLQuote } from '../helpers/ResourcesHelpers';
import * as LexiconHelpers from '../helpers/LexiconHelpers';
import {
  getContext,
  getSelectedToolApi,
  getSelectedToolContainer,
  getProjectSaveLocation,
  getSelectedSourceChapter,
  getSelectedSourceVerse,
  getSelectedTargetChapter,
  getSelectedTargetVerse,
  getSelectedToolName,
  getSourceBook,
  getSupportingToolApis,
  getTargetBook,
  getUsername,
  getProjects,
} from '../selectors';
import { getValidGatewayBiblesForTool } from '../helpers/gatewayLanguageHelpers';
import ProjectAPI from '../helpers/ProjectAPI';
import CoreAPI from '../helpers/CoreAPI';
import { promptForInvalidCheckFeedback } from '../helpers/FeedbackHelpers';

class ToolContainer extends Component {
  constructor(props) {
    super(props);
    this.makeToolProps = this.makeToolProps.bind(this);
    this.legacyToolsReducer = this.legacyToolsReducer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      contextId: nextContext, toolApi, supportingToolApis, selectedToolName,
    } = nextProps;

    // if contextId does not match current tool, then remove contextId
    if (nextContext && nextContext.tool !== selectedToolName) {
      nextProps.actions.changeCurrentContextId(undefined);
    }

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
   * @param {*} [nextProps] - the component props. If empty the current props will be used.
   * @return {*}
   */
  makeToolProps(nextProps = undefined) {
    if (!nextProps) {
      nextProps = this.props;
    }

    const {
      currentLanguage: { code },
      contextId,
      targetVerseText,
      targetBook,
      sourceBook,
      sourceVerse,
      targetChapter,
      sourceChapter,
      selectedToolName,
      projectApi,
      coreApi,
      projects,
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

      // menu location
      contextId,

      // project data
      targetVerseText,
      sourceVerse,
      targetChapter,
      sourceChapter,
      targetBook,
      sourceBook,
      selectedToolName,

      // deprecated props
      readProjectDir: (...args) => {
        console.warn('DEPRECATED: readProjectDir is deprecated. Use readProjectDataDir instead.');
        return projectApi.readDataDir(...args);
      },
      readProjectDirSync: (...args) => {
        console.warn('DEPRECATED: readProjectDirSync is deprecated. Use readProjectDataDirSync instead.');
        return projectApi.readDataDirSync(...args);
      },
      showIgnorableDialog: (...args) => {
        console.warn('DEPRECATED: showIgnorableDialog is deprecated. Use showIgnorableAlert instead');
        return coreApi.showIgnorableAlert(...args);
      },
      projectFileExistsSync: (...args) => {
        console.warn(`DEPRECATED: projectFileExistsSync is deprecated. Use projectDataPathExistsSync instead.`);
        return projectApi.dataPathExistsSync(...args);
      },
    };
  }

  /**
   * Builds a legacy tool reducer for tW.
   * This is a temporary hack
   */
  legacyToolsReducer() {
    const { selectedToolName, supportingToolApis } = this.props;
    return {
      currentToolName: selectedToolName,
      apis: supportingToolApis,
    };
  }

  render() {
    const {
      supportingToolApis,
      Tool,
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
      <div
        style={{
          display: 'flex', flex: 'auto', height: 'calc(100vh - 30px)',
        }}>
        <div style={{ flex: 'auto', display: 'flex' }}>
          <Tool
            {...props} // TODO: this is deprecated
            currentToolViews={{}} // TODO: this is deprecated
            {...activeToolProps}
          />
        </div>
      </div>
    );
  }
}

ToolContainer.propTypes = {
  projects: PropTypes.array.isRequired,
  toolApi: PropTypes.any,
  supportingToolApis: PropTypes.object.isRequired,
  Tool: PropTypes.any,
  contextId: PropTypes.object,
  projectSaveLocation: PropTypes.string.isRequired,
  targetVerseText: PropTypes.string,
  sourceVerse: PropTypes.object,
  sourceChapter: PropTypes.object,
  targetChapter: PropTypes.object,
  actions: PropTypes.any.isRequired,
  contextIdReducer: PropTypes.any.isRequired,
  currentLanguage: PropTypes.object.isRequired,
  openIgnorableAlert: PropTypes.func.isRequired,
  closeAlert: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,

  selectedToolName: PropTypes.string.isRequired,
};

ToolContainer.contextTypes = { store: PropTypes.any };

const mapStateToProps = state => {
  const projectPath = getProjectSaveLocation(state);
  return {
    projects: getProjects(state).map(p => new ProjectAPI(p.projectSaveLocation)),
    projectApi: new ProjectAPI(projectPath),
    selectedToolName: getSelectedToolName(state),
    Tool: getSelectedToolContainer(state),
    supportingToolApis: getSupportingToolApis(state),
    toolApi: getSelectedToolApi(state),
    targetBook: getTargetBook(state),
    sourceBook: getSourceBook(state),
    sourceVerse: getSelectedSourceVerse(state),
    targetVerseText: getSelectedTargetVerse(state),
    sourceChapter: getSelectedSourceChapter(state),
    targetChapter: getSelectedTargetChapter(state),
    contextId: getContext(state),
    projectSaveLocation: projectPath,
    username: getUsername(state),
    loginReducer: state.loginReducer,
    settingsReducer: state.settingsReducer,
    resourcesReducer: state.resourcesReducer,
    commentsReducer: state.commentsReducer,
    remindersReducer: state.remindersReducer,
    invalidatedReducer: state.invalidatedReducer,
    contextIdReducer: state.contextIdReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    selectionsReducer: state.selectionsReducer,
    verseEditReducer: state.verseEditReducer,
    groupsIndexReducer: state.groupsIndexReducer,
    groupsDataReducer: state.groupsDataReducer,
    groupMenuReducer: state.groupMenuReducer,
  };
};

const mapDispatchToProps = (dispatch) => ({
  coreApi: new CoreAPI(dispatch),
  openIgnorableAlert: (id, message, ignorable) => {
    dispatch(openIgnorableAlert(id, message, ignorable));
  },
  closeAlert: id => {
    console.warn('DEPRECATED: closeAlert is deprecated. Use tc.closeAlert instead');
    dispatch(closeAlert(id));
  },
  actions: {
    goToNext: () => {
      dispatch(changeToNextContextId());
    },
    goToPrevious: () => {
      dispatch(changeToPreviousContextId());
    },
    showPopover: (title, bodyText, positionCoord) => {
      dispatch(showPopover(title, bodyText, positionCoord));
    },
    loadResourceArticle: (resourceType, articleId, languageId, category='', async = false) => {
      dispatch(ResourcesActions.loadResourceArticle(resourceType, articleId,
        languageId, category, async));
    },
    loadLexiconEntry: (lexiconId, entryId) => {
      dispatch(ResourcesActions.loadLexiconEntry(lexiconId, entryId));
    },
    addComment: (text) => {
      dispatch(addComment(text));
    },
    changeSelections: (selections, nothingToSelect) => {
      dispatch(changeSelections(selections, null, null, null, nothingToSelect));
    },
    validateSelections: (targetVerse) => {
      dispatch(validateSelections(targetVerse));
    },
    toggleReminder: () => {
      dispatch(toggleReminder());
    },
    selectModalTab: (tab, section, vis) => {
      dispatch(selectModalTab(tab, section, vis));
    },
    editTargetVerse: (chapter, verse, before, after, tags) => {
      dispatch(
        editTargetVerse(chapter, verse, before, after, tags));
    },
    changeCurrentContextId: (contextId) => {
      dispatch(changeCurrentContextId(contextId));
    },
    loadCurrentContextId: () => {
      dispatch(loadCurrentContextId());
    },
    addGroupData: (groupId, groupData) => {
      dispatch(addGroupData(groupId, groupData));
    },
    setGroupsIndex: (groupsIndex) => {
      dispatch(loadGroupsIndex(groupsIndex));
    },
    updateRefreshCount: () => {
      dispatch(updateRefreshCount());
    },
    setToolSettings: (NAMESPACE, settingsPropertyName, toolSettingsData) => {
      dispatch(
        setToolSettings(NAMESPACE, settingsPropertyName, toolSettingsData));
    },
    openAlertDialog: (message) => {
      console.warn('DEPRECATED: openAlertDialog is deprecated. Use tc.showAlert instead');
      dispatch(openAlertDialog(message));
    },
    openOptionDialog: (alertMessage, callback, button1Text, button2Text) => {
      console.warn('DEPRECATED: openOptionsDialog is deprecated. Use  tc.showDialog instead.');
      dispatch(
        openOptionDialog(alertMessage, callback, button1Text, button2Text));
    },
    closeAlertDialog: () => {
      console.warn('DEPRECATED: closeAlertDialog is deprecated. use tc.closeAlert instead');
      dispatch(closeAlertDialog());
    },
    groupMenuChangeGroup: contextId => {
      dispatch(changeGroup(contextId));
    },
    groupMenuExpandSubMenu: isSubMenuExpanded => {
      dispatch(expandSubMenu(isSubMenuExpanded));
    },
    setFilter: (name, value) => {
      dispatch(setFilter(name, value));
    },
    getAvailableScripturePaneSelections: resourceList => {
      dispatch(getAvailableScripturePaneSelections(resourceList));
    },
    makeSureBiblesLoadedForTool: () => {
      dispatch(ResourcesActions.makeSureBiblesLoadedForTool());
    },
    onInvalidCheck: (contextId, selectedGL, moveToNext) => {
      dispatch(promptForInvalidCheckFeedback(contextId, selectedGL, moveToNext));
    },
    // TODO: these are not actions and should be inserted directly into the tool
    getWordListForVerse: VerseObjectUtils.getWordListForVerse,
    getGLQuote: getGLQuote,
    getLexiconData: LexiconHelpers.getLexiconData,
    getSelectionsFromContextId: getSelectionsFromContextId,
    getValidGatewayBiblesForTool: getValidGatewayBiblesForTool,
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolContainer);
