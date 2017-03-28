import consts from './CoreActionConsts';
import * as ModalActions from './ModalActions.js';

export function toggleLoader (val) {
  return {
    type: consts.TOGGLE_LOADER_MODAL,
    show: val
  }
}

export function killLoading () {
  return ((dispatch) => {
    dispatch(GetDataActions.clearPreviousData());
    dispatch(this.toggleLoader());
    dispatch(ModalActions.showModalContainer(true));
    dispatch(ModalActions.selectModalTab(2));
  });
}

export function update (show, progess) {
  return ((dispatch) => {
    debugger;
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

export function sendProgressForKey (name, progress) {
  return ((dispatch, getState) => {
    const loaderState = getState().loaderReducer;
    var progressObject = JSON.parse(JSON.stringify(loaderState.progressObject))
    var fetchDatas = loaderState.fetchDatas;
    progressObject[name] = progress;
    var currentProgress = 0;
    for (var key in progressObject) {
      currentProgress += progressObject[key];
    }
    return {
      type: consts.UPDATE_PROGRESS,
      progress: currentProgress / fetchDatas,
      progressObject: progressObject
    }
  })
}


export function updateNumberOfFetchDatas (fetchDatas) {
  return {
    type: consts.FETCH_DATA_NUMBER,
    fetchDatas: fetchDatas
  }
}
