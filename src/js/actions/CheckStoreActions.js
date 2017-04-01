const api = window.ModuleApi;
import BooksOfBible from '../components/core/BooksOfBible'
const CoreStore = require('../stores/CoreStore.js');
import * as CoreActionsRedux from './CoreActionsRedux.js';


export function setBookName(bookName) {
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


export function setGroupName(groupName) {
  return {
    type: consts.SET_GROUP_NAME,
    groupName:groupName
  }
}
export function setSubGroupObjects(subGroupObjects) {
  return {
    type: "SET_SUBGROUPS_OBJECTS",
    val: subGroupObjects,
  }
}

export function updateCurrentCheck(newCheck) {
  return ((dispatch) => {
    //TODO
  })
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

export function setGroupsObjects(groupsObjects) {
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

export function goToCheck(newGroupIndex, newCheckIndex) {
  return ((dispatch, getState) => {
    let { groups } = getState().checkStoreReducer;
    newGroupIndex = newGroupIndex || 0;
    newCheckIndex = newCheckIndex || 0;
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

export function goToNext() {
  return ((dispatch, getState) => {
    const { currentGroupIndex, currentCheckIndex, groups } = getState().checkStoreReducer;
    let newGroupIndex = 0;
    let newCheckIndex = 0;
    if ((currentCheckIndex + 1) < groups[currentGroupIndex].checks.length) {
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex + 1;
    } else if ((currentCheckIndex + 1) >= groups[currentGroupIndex].checks.length) {
      newGroupIndex = currentGroupIndex + 1;
      newCheckIndex = 0;
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

export function goToPrevious(currentGroupIndex, currentCheckIndex, groups) {
  return ((dispatch, getState) => {
    const { currentGroupIndex, currentCheckIndex, groups } = getState().checkStoreReducer;
    let newGroupIndex;
    let newCheckIndex;
    if (currentCheckIndex >= 1) {
      newGroupIndex = currentGroupIndex;
      newCheckIndex = currentCheckIndex - 1;
    } else if (currentCheckIndex == 0 && currentGroupIndex != 0) {
      newGroupIndex = currentGroupIndex - 1;
      newCheckIndex = 0;
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
      currentCheckIndex: newCheckIndex
    });
    dispatch({
      type: "UPDATE_CURRENT_CHECK",
      val: currentCheck
    });
  })
}

export function setCheckNameSpace(currentCheckNamespace) {
  return {
    type: "UPDATE_NAMESPACE",
    currentCheckNamespace: currentCheckNamespace
  }
}

export function changedCheckStatus(groupIndex, checkIndex, checkStatus) {
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
