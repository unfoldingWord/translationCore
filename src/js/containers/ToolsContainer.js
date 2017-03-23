import React from 'react';
import { connect } from 'react-redux';
import CheckStoreActions from '../actions/CheckStoreActions.js';
import { showNotification } from '../actions/NotificationActions.js';
import { showPopover } from '../actions/PopoverActions.js';
import { addNewResource, addNewBible } from '../actions/ResourcesActions.js';
import { addComment } from '../actions/CommentsActions.js';
import { addVerseEdit } from '../actions/VerseEditActions.js';
import { toggleReminder } from '../actions/RemindersActions.js';

class ToolsContainer extends React.Component {
    render() {
      let Tool = this.props.currentTool;
      return (
        <Tool {...this.props}/>
      );
    }
}

const mapStateToProps = (state) => {
  return Object.assign(
    {},
    state.checkStoreReducer,
    state.loginReducer,
    state.settingsReducer,
    state.statusBarReducer,
    state.loaderReducer,
    state.resourcesReducer,
    state.commentsReducer,
    state.remindersReducer

  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      updateCurrentCheck: (NAMESPACE, newCurrentCheck) => {
        dispatch(CheckStoreActions.updateCurrentCheck(NAMESPACE, newCurrentCheck));
      },
      handleGoToCheck: (newGroupIndex, newCheckIndex) => {
        dispatch(CheckStoreActions.goToCheck(newGroupIndex, newCheckIndex));
      },
      handleGoToNext: (NAMESPACE) => {
        dispatch(CheckStoreActions.goToNext(NAMESPACE));
      },
      handleGoToPrevious: (NAMESPACE) => {
        dispatch(CheckStoreActions.goToPrevious(NAMESPACE));
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
      addComment: (text, userName) => {
        dispatch(addComment(text, userName));
      },
      toggleReminder: (userName) => {
        dispatch(toggleReminder(userName));
      },
      addVerseEdit: (text, userName) => {
        dispatch(addVerseEdit(text, userName));
      }
    };
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ToolsContainer);
