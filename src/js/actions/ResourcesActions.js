import consts from './CoreActionConsts'
import * as coreActions from './CoreActionsRedux'


export const addNewBible = (bibleName, bibleData) => ({
  type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
  bibleName,
  bibleData
})

export const addNewResource = (resourceName, resourceData, namespace) => {
  return ((dispatch, getState) => {
    const currentCheckIndex = getState().checkStoreReducer.currentCheckIndex || 0;
    const currentGroupIndex = getState().checkStoreReducer.currentGroupIndex || 0;
    if (resourceName == 'groups') {
      dispatch(coreActions.setUpGroupObjectsFromIndex(resourceData, currentCheckIndex, currentGroupIndex));
    }
    dispatch({
      type: consts.ADD_NEW_RESOURCE,
      resourceName,
      resourceData,
      namespace
    });
  });
}

