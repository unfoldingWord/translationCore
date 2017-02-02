var consts = require('./CoreActionConsts');
module.exports.showModalContainer = function (val) {
  return {
    type: consts.SHOW_MODAL_CONTAINER,
    val: val
  }
}

module.exports.selectModalTab = function (tabKey, sectionKey) {
  return {
    type: consts.SELECT_MODAL_TAB,
    tab: tabKey,
    section: sectionKey
  }
}
