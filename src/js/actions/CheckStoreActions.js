const api = window.ModuleApi;
import BooksOfBible from '../components/core/BooksOfBible'
const CoreStore = require('../stores/CoreStore.js');
const CoreActionsRedux = require('./CoreActionsRedux.js');


module.exports.setBookName = function (bookName) {
  let bookAbbr = convertToBookAbbreviation(bookName);
  return {
    type: "SET_BOOK_NAME",
    val: bookName,
    bookAbbr
  }
}

export const convertToFullBookName = (bookAbbr) => {
  if (!bookAbbr) return;
  return BooksOfBible[bookAbbr.toString().toLowerCase()];
}

/**
  * @description - Takes in a full book name or book abbreviation and returns the abbreviation.
  * ex. convertToBookAbbreviation('2 Timothy') => '2ti'
  * @param {string} fullBookName - A book name or abbreviation. In the case of abbreviation the
  * abbreviation will just be returned
*/
export const convertToBookAbbreviation = (fullBookName) => {
  if (!fullBookName) return;
  for (var key in BooksOfBible) {
    if (BooksOfBible[key].toString().toLowerCase() == fullBookName.toString().toLowerCase() ||
      fullBookName.toString().toLowerCase() == key) {
      return key;
    }
  }
}

module.exports.setGroupsObjects = function (groupsObjects) {
  return ((dispatch) => {

    function quickSort(array) {
      if (array.length < 2) {
        return array;
      }

      const pivot = array[0];
      const lesser = [];
      const greater = [];

      for (let i = 1; i < array.length; i++) {
        if (array[i].chapter <= pivot.chapter && array[i].verse <= pivot.verse && array[i].wordIndex <= pivot.wordIndex) {
          lesser.push(array[i]);
        } else {
          greater.push(array[i]);
        }
      }
      return quickSort(lesser).concat(pivot, quickSort(greater));
    }
    for (let group in groupsObjects) {
      let newGroup = quickSort(groupsObjects[group].checks)
      groupsObjects[group].checks = newGroup;
    }
    dispatch({
      type: "SET_GROUPS_OBJECTS",
      val: groupsObjects,
    });
  });
}

module.exports.updateCurrentCheck = function (NAMESPACE, oldCheck) {
  return ((dispatch) => {
    const newCurrentCheck = JSON.parse(JSON.stringify(oldCheck));
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
    api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
    api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
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
    if ((currentCheckIndex + 1) < groups[currentGroupIndex].checks.length) {
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex + 1;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    } else if ((currentCheckIndex + 1) >= groups[currentGroupIndex].checks.length) {
      newGroupIndex = currentGroupIndex + 1;
      newCheckIndex = 0;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    }
    let currentCheck = groups[newGroupIndex]['checks'][newCheckIndex];
    var lastCheck = currentCheckIndex + 1 >= groups[currentGroupIndex].checks.length;
    if (lastCheck) {
      dispatch({ type: "TOGGLE_SUBMENU", openCheck: newGroupIndex, newGroup: true });
    }
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
    if (currentCheckIndex >= 1) {
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex - 1;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    } else if (currentCheckIndex == 0 && currentGroupIndex != 0) {
      newGroupIndex = currentGroupIndex - 1;
      newCheckIndex = 0;
      api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
      api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
    } else if (currentCheckIndex == 0 && currentGroupIndex == 0) {
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex;
    }
    let currentCheck = groups[newGroupIndex]['checks'][newCheckIndex];
    var lastCheck = currentCheckIndex - 1 < 0;
    if (lastCheck) {
      dispatch({ type: "TOGGLE_SUBMENU", openCheck: newGroupIndex, newGroup: true });
    }
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

module.exports.setCheckNameSpace = function (currentCheckNameSpace) {
  return {
    type: "UPDATE_NAMESPACE",
    currentCheckNameSpace: currentCheckNameSpace
  }
}

module.exports.changedCheckStatus = function (groupIndex, checkIndex, checkStatus) {
  return ((dispatch, getState) => {
    const store = getState().checkStoreReducer;
    let groupObjects = store.groups;
    let currentGroupIndex = store.currentGroupIndex;
    let currentCheckIndex = store.currentCheckIndex;
    let currentSubGroupObjects;
    if (currentGroupIndex != null && groupObjects != null) {
      currentSubGroupObjects = groupObjects[currentGroupIndex]['checks'];
    }
    const newSubGroupObjects = currentSubGroupObjects.slice(0);
    newSubGroupObjects[currentCheckIndex].checkStatus = checkStatus;
    const newGroupObjects = groupObjects.slice(0);
    newGroupObjects[currentGroupIndex].checks = newSubGroupObjects;
    newGroupObjects[currentGroupIndex].currentGroupprogress = CoreActionsRedux.getGroupProgress(newGroupObjects[currentGroupIndex]);
    dispatch(this.setGroupsObjects(newGroupObjects));
    return {
      type: "CHANGED_CHECK_STATUS"
    }
  });
}