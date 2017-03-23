import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

export const linkModuleData = (selectionId, commentId, verseEditId, reminderId, userName) => {
  return {
    type: consts.LINK_MODULE_DATA,
    selectionId,
    commentId,
    verseEditId,
    reminderId,
    modifiedTimestamp: generateTimestamp(),
    userName
  }
}
