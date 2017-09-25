import consts from './ActionTypes';

export function showModalContainer(val) {
  return {
    type: consts.SHOW_MODAL_CONTAINER,
    val: val
  };
}

export function selectModalTab(tabKey, sectionKey, visiblity) {
  return {
    type: consts.SELECT_MODAL_TAB,
    tab: tabKey,
    section: sectionKey,
    visible: visiblity
  };
}

export function selectSectionTab(tabKey, sectionKey) {
  return ((dispatch) => {
    dispatch({
      type: 'SELECT_MODAL_SECTION',
      tab: tabKey,
      section: sectionKey
    });
  });
}
