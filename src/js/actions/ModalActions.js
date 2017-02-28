const consts = require('./CoreActionConsts');
const ImportOnlineActions = require('./ImportOnlineActions');

module.exports.showModalContainer = function (val) {
  return {
    type: consts.SHOW_MODAL_CONTAINER,
    val: val
  }
}

module.exports.selectModalTab = function (tabKey, sectionKey, visiblity) {
  return {
    type: consts.SELECT_MODAL_TAB,
    tab: tabKey,
    section: sectionKey,
    visible:visiblity
  }
}

module.exports.selectSectionTab = function (tabKey, sectionKey) {
  return ((dispatch) => {
    dispatch({
      type: 'SELECT_MODAL_SECTION',
      tab: tabKey,
      section: sectionKey
    })
  })
  if(sectionKey==2) dispatch(ImportOnlineActions.updateRepos());
}
