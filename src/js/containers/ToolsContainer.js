import React from 'react';
import { connect } from 'react-redux';
import { showNotification } from '../actions/NotificationActions.js';
import { showPopover } from '../actions/PopoverActions.js';
import { addNewResource, addNewBible } from '../actions/ResourcesActions.js';
import { addComment } from '../actions/CommentsActions.js';
import { addVerseEdit } from '../actions/VerseEditActions.js';
import { toggleReminder } from '../actions/RemindersActions.js';
import { changeSelections } from '../actions/SelectionsActions.js';
import {changeCurrentContextId, changeToNextContextId, changeToPreviousContextId} from '../actions/ContextIdActions.js';
import {addGroupsData} from '../actions/GroupsDataActions.js';
import {changeGroupsIndex} from '../actions/GroupsIndexActions.js';
import * as CheckStoreActions from '../actions/CheckStoreActions.js';
import {setModuleSettings, changeModuleSettings} from '../actions/ModulesSettingsActions.js';


class ToolsContainer extends React.Component {
  render() {
    let Tool = this.props.currentTool;
    return (
      <Tool {...this.props} />
    );
  }
}

const mapStateToProps = state => {
  return {
    modules: state.coreStoreReducer.modules,
    checkStoreReducer: state.checkStoreReducer,
    loginReducer: state.loginReducer,
    settingsReducer: state.settingsReducer,
    statusBarReducer: state.statusBarReducer,
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
    modulesSettingsReducer: state.modulesSettingsReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      goToNext: () => {
        dispatch(changeToNextContextId());
      },
      goToPrevious: () => {
        dispatch(changeToPreviousContextId());
      },
      showNotification: (message, duration) => {
        dispatch(showNotification(message, duration));
      },
      showPopover: (title, bodyText, positionCoord) => {
        dispatch(showPopover(title, bodyText, positionCoord));
      },
      addNewResource: (resourceName, resourceData) => {
        dispatch(addNewResource(resourceName, resourceData));
      },
      addNewBible: (bibleName, bibleData) => {
        dispatch(addNewBible(bibleName, bibleData));
      },
      progress: (progress) => {
        console.log(progress);
      },
      addComment: (text, userName) => {
        dispatch(addComment(text, userName));
      },
      changeSelections: (selections, userName) => {
        dispatch(changeSelections(selections, userName));
      },
      removeSelections: (text, userName) => {
        dispatch(removeSelections(text, userName));
      },
      toggleReminder: (userName) => {
        dispatch(toggleReminder(userName));
      },
      addVerseEdit: (before, after, tags, userName) => {
        dispatch(addVerseEdit(before, after, tags, userName));
      },
      changeCurrentContextId: (contextId) => {
        dispatch(changeCurrentContextId(contextId));
      },
      addGroupData: (groupId, groupData) => {
        dispatch(addGroupData(groupId, groupData));
      },
      changeGroupsIndex: (groupsIndex) => {
        dispatch(changeGroupsIndex(groupsIndex));
      },
      setModuleSettings: (NAMESPACE, settingsPropertyName, moduleSettingsData) => {
        dispatch(setModuleSettings(NAMESPACE, settingsPropertyName, moduleSettingsData));
      },
      changeModuleSettings: (NAMESPACE, settingsPropertyName, moduleSettingsData) => {
        dispatch(changeModuleSettings(NAMESPACE, settingsPropertyName, moduleSettingsData));
      }
    }
  };
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ToolsContainer);
