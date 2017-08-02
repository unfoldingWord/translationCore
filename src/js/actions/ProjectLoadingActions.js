/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as GroupsDataActions from './GroupsDataActions';
import * as GroupsIndexActions from './GroupsIndexActions';
import * as LoaderActions from './LoaderActions';
import * as BodyUIActions from './BodyUIActions';
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
/**
 * @description function that handles both getGroupsIndex and
 * getGroupsData with promises.
 * @param {string} currentToolName - name of the tool being loaded.
 * @return {object} object action.
 */
export function loadProjectData(currentToolName) {
  return ((dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let { projectDetailsReducer } = getState();
      let { projectSaveLocation, params } = projectDetailsReducer;
      const dataDirectory = path.join(projectSaveLocation, '.apps', 'translationCore', 'index', currentToolName);

      getGroupsIndex(dispatch, dataDirectory, currentToolName)
        .then(() => {
          getGroupsData(dispatch, dataDirectory, currentToolName, params)
          .then(() => {
            dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
            dispatch({ type: consts.TOGGLE_LOADER_MODAL, show: false });
            dispatch(BodyUIActions.toggleHomeView(false));
          });
        });
    })
    .catch(err => {
      console.warn(err);
      AlertModalActions.openAlertDialog("Oops! We have encountered a problem loading your project. Please contact Help Desk (help@door43.org) for assistance.");
    });
  })
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group index data path location in the filesystem.
 * @return {object} object action / Promises.
 */
function getGroupsIndex(dispatch, dataDirectory, currentToolName) {
  return new Promise((resolve, reject) => {
    const groupIndexDataDirectory = path.join(dataDirectory, 'index.json');
    let groupIndexData;
    if (fs.existsSync(groupIndexDataDirectory)) {
      try {
        groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
        dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
        console.log('Loaded group index data from fs');
        resolve(true);
      } catch (err) {
        console.log(err);
        resolve(true);
      }
    } else {
      // The groupIndex file was not found in the directory thus copy
      // it from User resources folder to project resources folder.
      ResourcesHelpers.copyGroupsIndexToProjectResources(currentToolName, dataDirectory)
      // then read in the groupIndex file
      groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
      // load groupIndex to reducer
      dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
      console.log('Generated and Loaded group index data from fs');
      resolve(true);
    }
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group data path or save location in the filesystem.
 * @param {string} currentToolName - name if the tool being loaded.
 * @param {object} params - object of project details params.
 * @return {object} object action / Promises.
 */
export function getGroupsData(dispatch, dataDirectory, currentToolName, params) {
  return new Promise((resolve, reject) => {
    let groupsDataDirectory = path.join(dataDirectory, params.bookAbbr);
    if (fs.existsSync(groupsDataDirectory)) {
      // read in the groupsData files and load groupsData to reducer
      loadAllGroupsData(groupsDataDirectory, currentToolName, dispatch);
      console.log('Loaded group data from fs');
      resolve(true);
    } else {
      // The groups data files were not found in the directory thus copy
      // them from User resources folder to project resources folder.
      ResourcesHelpers.copyGroupsDataToProjectResources(currentToolName, groupsDataDirectory, params.bookAbbr);
      // read in the groupsData files and load groupsData to reducer
      loadAllGroupsData(groupsDataDirectory, currentToolName, dispatch);
      console.log('Generated and Loaded group data data from fs');
      resolve(true);
    }
  });
}

/**
 * @description loads all the groups data files from filesystem.
 * @param {array} groupDataFolderObjs - 
 * @param {string} groupsDataDirectory - groups data save location in the filesystem.
 * @param {string} currentToolName - name of the current tool being selected/used.
 * @param {function} dispatch - redux dispatch function.
 * @return {object} object action / Promises.
 */
function loadAllGroupsData(groupsDataDirectory, currentToolName, dispatch) {
  // read in the groupsData files
  let groupDataFolderObjs = fs.readdirSync(groupsDataDirectory);
  let allGroupsData = {};
  let total = groupDataFolderObjs.length;
  let i = 0;
  for (let groupId in groupDataFolderObjs) {
    if (path.extname(groupDataFolderObjs[groupId]) !== '.json') {
      total--;
      continue;
    }
    let groupName = groupDataFolderObjs[groupId].split('.')[0];
    let groupData = loadGroupData(groupName, groupsDataDirectory);
    if (groupData) {
      allGroupsData[groupName] = groupData;
    }
    dispatch(LoaderActions.sendProgressForKey(currentToolName, i / total * 100));
    i++;
  }
  // load groupsData to reducer
  dispatch({
    type: consts.LOAD_GROUPS_DATA_FROM_FS,
    allGroupsData
  });
}

/**
 * @description helper function that loads a group data file
 * from the filesystem.
 * @param {string} groupName - group data name.
 * @param {string} groupDataFolderPath - group data save location in the filesystem.
 * @return {object} object action / Promises.
 */
function loadGroupData(groupName, groupDataFolderPath) {
  const groupPath = path.join(groupDataFolderPath, groupName + '.json');
  let groupData;
  try {
    groupData = fs.readJsonSync(groupPath);
  } catch (err) {
    console.warn('failed loading group data for ' + groupName);
  }
  return groupData;
}