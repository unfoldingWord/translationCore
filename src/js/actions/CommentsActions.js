import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';

export const addComment = (text, userName) => {
  return {
    type: consts.ADD_COMMENT,
    modifiedTimestamp: generateTimestamp(),
    text,
    userName
  }
}
