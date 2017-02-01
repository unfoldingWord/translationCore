const api = window.ModuleApi;
const CoreStore = require('../stores/CoreStore.js');


module.exports.setBookName = function (bookName) {
  return {
    type: "SET_BOOK_NAME",
    val: bookName,
  }
}

module.exports.setGroupsObjects = function (groupsObjects) {
  return {
    type: "SET_GROUPS_OBJECTS",
    val: groupsObjects,
  }
}

module.exports.updateCurrentCheck = function (NAMESPACE, newCurrentCheck) {
  return ((dispatch) => {
    let currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    let currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    let newGroupsObjects = api.getDataFromCheckStore(NAMESPACE, 'groups');
    newGroupsObjects[currentGroupIndex]['checks'][currentCheckIndex] = newCurrentCheck;
    api.putDataInCheckStore(NAMESPACE, 'groups', newGroupsObjects);
    dispatch({
      type: "SET_GROUPS_OBJECTS",
      val: newGroupsObjects,
    });
    dispatch({
      type: "UPDATE_CURRENT_CHECK",
      val: newCurrentCheck,
    });
  })
}

module.exports.goToCheck = function (NAMESPACE, newGroupIndex, newCheckIndex) {
  return ((dispatch) => {
    let groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    let currentCheck = groups[newGroupIndex]['checks'][newCheckIndex];
    dispatch({
      type: "GO_TO_CHECK",
      currentGroupIndex: newGroupIndex,
      currentCheckIndex: newCheckIndex,
    });
    dispatch({
      type: "UPDATE_CURRENT_CHECK",
      val: currentCheck,
    });
  })
}

module.exports.goToNext = function (NAMESPACE) {
  return ((dispatch) => {
    let newGroupIndex = 0;
    let newCheckIndex = 0;
    let currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    let currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    let groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    if((currentCheckIndex + 1) < groups[currentGroupIndex].checks.length){
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex + 1;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    }else if((currentCheckIndex + 1) >= groups[currentGroupIndex].checks.length){
      newGroupIndex = currentGroupIndex + 1;
      newCheckIndex = 0;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    }
    let currentCheck = groups[newGroupIndex]['checks'][newCheckIndex];
    dispatch({
      type: "GO_TO_NEXT",
      currentGroupIndex: newGroupIndex,
      currentCheckIndex: newCheckIndex,
    });
    dispatch({
      type: "UPDATE_CURRENT_CHECK",
      val: currentCheck,
    });
  })
}

module.exports.goToPrevious = function (NAMESPACE) {
  return ((dispatch) => {
    let newGroupIndex;
    let newCheckIndex;
    let currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    let currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    let groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    if(currentCheckIndex >= 1){
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex - 1;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    }else if (currentCheckIndex == 0 && currentGroupIndex != 0) {
      newGroupIndex = currentGroupIndex - 1;
      newCheckIndex = 0;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    }else if(currentCheckIndex == 0 && currentGroupIndex == 0){
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex;
    }
    let currentCheck = groups[newGroupIndex]['checks'][newCheckIndex];
    dispatch({
      type: "GO_TO_PREVIOUS",
      currentGroupIndex: newGroupIndex,
      currentCheckIndex: newCheckIndex,
    });
    dispatch({
      type: "UPDATE_CURRENT_CHECK",
      val: currentCheck,
    });
  })
}
