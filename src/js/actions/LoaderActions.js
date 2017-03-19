const consts = require('./CoreActionConsts');
const UploadMethods = require('../components/core/UploadMethods.js');
const ModalActions = require('./ModalActions.js');

module.exports.toggleLoader = function (val) {
  return {
    type: consts.TOGGLE_LOADER_MODAL,
    show: val
  }
}

module.exports.saveModule = function (identifier, module) {
  return {
    type: consts.SAVE_MODULE,
    identifier,
    module
  }
}

module.exports.killLoading = function () {
  return ((dispatch) => {
    UploadMethods.clearPreviousData();
    dispatch(this.toggleLoader());
    dispatch(ModalActions.showModalContainer(true));
    dispatch(ModalActions.selectModalTab(2));
  });
}

module.exports.update = function (show, progess) {
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

module.exports.sendProgressForKey = function (name, progress, store) {
  var progressObject = JSON.parse(JSON.stringify(store.progressObject))
  var fetchDatas = store.fetchDatas;
  progressObject[name] = progress;
  var currentProgress = 0;
  for (var key in progressObject) {
    currentProgress += progressObject[key];
  }
  return {
    type: consts.UPDATE_PROGRESS,
    progress: currentProgress / fetchDatas,
    progressObject:progressObject
  }
}


module.exports.updateNumberOfFetchDatas = function (fetchDatas) {
  return {
    type: consts.FETCH_DATA_NUMBER,
    fetchDatas: fetchDatas
  }
}