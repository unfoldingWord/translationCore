const consts = require('./CoreActionConsts');

module.exports.toggleLoader = function () {
  return {
    type: consts.TOGGLE_LOADER_MODAL,
  }
}

module.exports.saveModule = function (identifier, module) {
  return{
    type: consts.SAVE_MODULE,
    identifier,
    module
  }
}
