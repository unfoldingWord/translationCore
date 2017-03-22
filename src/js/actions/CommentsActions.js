import consts from '../actions/CoreActionConsts'
//import {timestampGenerator} from '../helpers/index'

export const addComment = (text, userName) => {
  return {
    type: consts.ADD_COMMENT,
    modifiedTimestamp: "2017",//timestampGenerator(),
    text,
    userName
  }
}