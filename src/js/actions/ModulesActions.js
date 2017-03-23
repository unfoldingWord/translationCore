import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

/**
 * @description updates selectionId
 * @param selectionId
 * @return state?
 */
export const updateModuleDataSelectionId = (selectionId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_SELECTION_ID,
    selectionId
  }
}

export const updateModuleDataCommentId = (commentId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_COMMENT_ID,
    commentId
  }
}

export const updateModuleDataVerseEditId = (verseEditId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_VERSEEDIT_ID,
    verseEditId
  }
}

export const updateModuleDataReminderId = (reminderId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_REMINDER_ID,
    reminderId
  }
}

export const linkModuleData = (userName) => {
  return {
    type: consts.LINK_MODULE_DATA,
    modifiedTimestamp: generateTimestamp(),
    userName
  }
}
