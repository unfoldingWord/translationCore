import consts from './ActionTypes';

export function toggleLoader(val) {
  return ((dispatch) => {
    if (val === true) window.setTimeout(() => dispatch(toggleWaitingTooLongButton(true)), 3000)
    dispatch({
      type: consts.TOGGLE_LOADER_MODAL,
      show: val
    })
  });
}

/**
 * @description gets the progress for a specific process.
 * @param {string} processName - label name for the specific process that the progress is being loaded for.
 * @param {number} progress - calculated progress of a specific process.
 */
export function sendProgressForKey(processName, progress) {
  return (dispatch => {
    dispatch({
      type: consts.UPDATE_PROGRESS,
      processName,
      progress
    });
  });
}

export function toggleWaitingTooLongButton(showResetButton) {
  return ((dispatch, getState) => {
    let { show } = getState().loaderReducer;
    if (show) {
      dispatch({
        type: consts.TOGGLE_RESET_LOADING_BUTTON,
        showResetButton
      })
    }
  })
}
