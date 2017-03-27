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
      dispatch(coreActions.setUpGroupObjectsAndCurrentCheck(resourceData, currentCheckIndex, currentGroupIndex));
      return;
    }
    if (resourceName == 'currentCheckIndex') {
      dispatch({ type: "GO_TO_CHECK", currentCheckIndex: resourceData, currentGroupIndex:currentGroupIndex })
      return;
    }
    if (resourceName == 'currentGroupIndex') {
      dispatch({ type: "GO_TO_CHECK", currentGroupIndex: resourceData, currentCheckIndex:currentCheckIndex })
      return;
    }
    dispatch({
      type: consts.ADD_NEW_RESOURCE,
      resourceName,
      resourceData,
      namespace
    });
  });
}

