import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// actions
import { showPopover } from '../actions/PopoverActions';
import { addComment } from '../actions/CommentsActions';
import { addVerseEdit } from '../actions/VerseEditActions';
import { toggleReminder } from '../actions/RemindersActions';
import { changeSelections, validateSelections } from '../actions/SelectionsActions';
import { changeCurrentContextId, loadCurrentContextId, changeToNextContextId, changeToPreviousContextId } from '../actions/ContextIdActions';
import { addGroupData } from '../actions/GroupsDataActions';
import { setGroupsIndex } from '../actions/GroupsIndexActions';
import { setToolSettings } from '../actions/SettingsActions';
import { openAlertDialog, openOptionDialog, closeAlertDialog } from '../actions/AlertModalActions';
import { selectModalTab } from '../actions/ModalActions';
import * as ResourcesActions from '../actions/ResourcesActions';
import * as WordAlignmentActions from '../actions/WordAlignmentActions';

class ToolsContainer extends React.Component {

  componentDidMount() {
    let { contextId } = this.props.contextIdReducer;
    if (!contextId) this.props.actions.loadCurrentContextId();
  }

  componentWillReceiveProps(nextProps) {
    let { contextId } = nextProps.contextIdReducer;
    let { currentToolName } = nextProps.toolsReducer;
    // if contextId does not match current tool, then remove contextId
    if (contextId && contextId.tool !== currentToolName) {
      nextProps.actions.changeCurrentContextId(undefined);
    }
  }

  render() {
    let { currentToolViews, currentToolName } = this.props.toolsReducer;
    let Tool = currentToolViews[currentToolName];

    return (
      <Tool {...this.props} currentToolViews={currentToolViews} />
    );
  }
}

ToolsContainer.propTypes = {
    toolsReducer: PropTypes.any.isRequired,
    actions: PropTypes.any.isRequired,
    contextIdReducer: PropTypes.any.isRequired
};

const mapStateToProps = state => {
  return {
    toolsReducer: state.toolsReducer,
    loginReducer: state.loginReducer,
    settingsReducer: state.settingsReducer,
    loaderReducer: state.loaderReducer,
    resourcesReducer: state.resourcesReducer,
    commentsReducer: state.commentsReducer,
    remindersReducer: state.remindersReducer,
    contextIdReducer: state.contextIdReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    selectionsReducer: state.selectionsReducer,
    verseEditReducer: state.verseEditReducer,
    groupsIndexReducer: state.groupsIndexReducer,
    groupsDataReducer: state.groupsDataReducer,
    wordAlignmentReducer: state.wordAlignmentReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
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
      addNewBible: (bibleName, bibleData) => {
        dispatch(ResourcesActions.addNewBible(bibleName, bibleData));
      },
      loadResourceArticle: (resourceType, articleId) => {
        dispatch(ResourcesActions.loadResourceArticle(resourceType, articleId));
      },
      loadLexiconEntry: (lexiconId, entryId) => {
        dispatch(ResourcesActions.loadLexiconEntry(lexiconId, entryId));
      },
      addComment: (text, userName) => {
        dispatch(addComment(text, userName));
      },
      changeSelections: (selections, userName) => {
        dispatch(changeSelections(selections, userName));
      },
      validateSelections: (targetVerse) => {
        dispatch(validateSelections(targetVerse));
      },
      toggleReminder: (userName) => {
        dispatch(toggleReminder(userName));
      },
      selectModalTab: (tab, section, vis) => {
        dispatch(selectModalTab(tab, section, vis));
      },
      addVerseEdit: (before, after, tags, userName) => {
        dispatch(addVerseEdit(before, after, tags, userName));
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
        dispatch(setGroupsIndex(groupsIndex));
      },
      setToolSettings: (NAMESPACE, settingsPropertyName, toolSettingsData) => {
        dispatch(setToolSettings(NAMESPACE, settingsPropertyName, toolSettingsData));
      },
      openAlertDialog: (message) => {
        dispatch(openAlertDialog(message));
      },
      openOptionDialog: (alertMessage, callback, button1Text, button2Text) => {
        dispatch(openOptionDialog(alertMessage, callback, button1Text, button2Text));
      },
      closeAlertDialog: () => {
        dispatch(closeAlertDialog());
      },
      moveWordBankItemToAlignment: (DropBoxItemIndex, WordBankItem) => {
        dispatch(WordAlignmentActions.moveWordBankItemToAlignment(DropBoxItemIndex, WordBankItem));
      },
      moveTopWordItemToAlignment: (topWordItem, fromAlignmentIndex, toAlignmentIndex) => {
        dispatch(WordAlignmentActions.moveTopWordItemToAlignment(topWordItem, fromAlignmentIndex, toAlignmentIndex));
      },
      moveBackToWordBank: (wordBankItem) => {
        dispatch(WordAlignmentActions.moveBackToWordBank(wordBankItem));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsContainer);
