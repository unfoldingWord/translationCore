import consts from './ActionTypes';
/**
 * Wrapper action for handling project information detection, and 
 * storing result in reducer. Returns false under step namespace
 * if check is passed
 */
export function validate() {
  return ((dispatch) => {
    dispatch({
      type: consts.COPYRIGHT_CHECK
    })
  })
}

export function finalize() {
  return ((dispatch, getState) => {
  })
}