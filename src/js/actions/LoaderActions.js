import consts from './ActionTypes';
import * as ModalActions from './ModalActions.js';
import * as GetDataActions from './GetDataActions';


export function toggleLoader(val) {
  return {
    type: consts.TOGGLE_LOADER_MODAL,
    show: val
  }
}

export function killLoading() {
  return ((dispatch) => {
    dispatch(GetDataActions.clearPreviousData());
    dispatch(this.toggleLoader());
    dispatch(ModalActions.showModalContainer(true));
    dispatch(ModalActions.selectModalTab(2));
  });
}

export function update(show, progess) {
  return ((dispatch) => {
    if (!show) {
      setTimeout(() => {
        dispatch({
          type: consts.UPDATE_LOADER,
          reloadContent: <h3>Taking too long? <a onClick={this.killLoading}>Cancel loading</a></h3>
        });
      }, 10000);
    }

    dispatch({
      type: consts.UPDATE_LOADER,
      progress: progess,
      reloadContent: null
    })
    dispatch(this.toggleLoader());
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
