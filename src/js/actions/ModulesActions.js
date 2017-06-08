import consts from './ActionTypes';
import {generateTimestamp} from '../helpers/index';

/**
 * @description updates selectionId so they can be linked later
 * @param {String} selectionId - the id of the other action
 * @return {Object} - an action object with the id
 */
export const updateModuleDataSelectionId = (selectionId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_SELECTION_ID,
    selectionId
  }
}
/**
 * @description updates commentId so they can be linked later
 * @param {String} commentId - the id of the other action
 * @return {Object} - an action object with the id
 */
export const updateModuleDataCommentId = (commentId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_COMMENT_ID,
    commentId
  }
}
/**
 * @description updates verseEditId so they can be linked later
 * @param {String} verseEditId - the id of the other action
 * @return {Object} - an action object with the id
 */
export const updateModuleDataVerseEditId = (verseEditId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_VERSEEDIT_ID,
    verseEditId
  }
}
/**
 * @description updates reminderId so they can be linked later
 * @param {String} reminderId - the id of the other action
 * @return {Object} - an action object with the id
 */
export const updateModuleDataReminderId = (reminderId) => {
  return {
    type: consts.UPDATE_MODULE_DATA_REMINDER_ID,
    reminderId
  }
}
/**
 * @description updates username, modifiedTimestamp when all is linked together
 * @param {String} userName - the userName that links the other ids
 * @return {Object} - an action object with the id
 */
export const linkModuleData = (userName) => {
  return {
    type: consts.LINK_MODULE_DATA,
    modifiedTimestamp: generateTimestamp(),
    userName
  }
}
