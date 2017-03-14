const consts = require('./CoreActionConsts');

module.exports.toggleLoader = function () {
  return {
    type: consts.TOGGLE_LOADER_MODAL,
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
  Upload.clearPreviousData();
  this.toggleLoaderModal();
  this.showProjectsInModal(true);
}

module.exports.update = function () {
  //TODO
  if (CoreStore.doneLoading === this.props.loaderReducer.show) {
    if (!CoreStore.doneLoading) {
      setTimeout(() => {
        this.setState(merge({}, this.state, {
          loaderModalProps: {
            reloadContent: <h3>Taking too long? <a onClick={this.killLoading}>Cancel loading</a></h3>
          }
        }));
      }, 10000);
    }
    this.setState(merge({}, this.state, {
      loaderModalProps: {
        progress: CoreStore.getProgress(),
        reloadContent: null
      }
    }));
    this.props.toggleLoaderModal();
  }
}