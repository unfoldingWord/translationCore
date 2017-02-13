const consts = require('./CoreActionConsts');

module.exports.toggleLoader = function () {
  return {
    type: consts.TOGGLE_LOADER_MODAL,
  }
}
