import consts from '../actions/CoreActionConsts'
import {timestampGenerator} from '../helpers/index'

export const addComment = (text, userName) => {
  return {
    type: consts.ADD_COMMENT,
    modifiedTimestamp: timestampGenerator(),
    text,
    userName
  }
}