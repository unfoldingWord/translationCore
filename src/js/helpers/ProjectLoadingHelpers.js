import fs from 'fs-extra';
import path from 'path-extra';
import consts from './ActionTypes';
// actions
import * as GroupsDataActions from './GroupsDataActions';
import * as GroupsIndexActions from './GroupsIndexActions';
import * as LoaderActions from './LoaderActions';
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group index data path location in the filesystem.
 * @return {object} object action / Promises.
 */
export function getGroupsIndex(dispatch, toolName, dataDirectory) {
  return new Promise((resolve, reject) => {
    const groupIndexDataDirectory = path.join(dataDirectory, 'index.json');
    let groupIndexData;
    if (fs.existsSync(groupIndexDataDirectory)) {
      try {
        groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
        dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
        console.log('Loaded group index data from fs');
        resolve();
      } catch (err) {
        console.log(err);
        resolve();
      }
    } else {
      // The groupIndex file was not found in the directory thus copy
      // it from User resources folder to project resources folder.
      ResourcesHelpers.copyGroupsIndexToProjectResources(toolName, dataDirectory)
      // then read in the groupIndex file
      groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
      // load groupIndex to reducer
      dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
      console.log('Generated and Loaded group index data from fs');
      resolve();
    }
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group data path or save location in the filesystem.
 * @param {string} toolName - name if the tool being loaded.
 * @param {object} params - object of project details params.
 * @return {object} object action / Promises.
 */
export function getGroupData(dispatch, dataDirectory, toolName, params) {
  return new Promise((resolve, reject) => {
    let groupsDataDirectory = path.join(dataDirectory, params.bookAbbr);
    let allGroupsData = {};
    if (fs.existsSync(groupsDataDirectory)) {
      // read in the groupsData files
      let groupDataFolderObjs = fs.readdirSync(groupsDataDirectory);
      // read in the groupsData files
      allGroupsData = loadAllGroupsData(groupDataFolderObjs, groupsDataDirectory, dispatch, toolName);
      // then load groupsData to reducer
      dispatch({
        type: consts.LOAD_GROUPS_DATA_FROM_FS,
        allGroupsData
      });
      dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
      console.log('Loaded group data from fs');
      resolve(true);
    } else {
      // The groups data files were not found in the directory thus copy
      // them from User resources folder to project resources folder.
      ResourcesHelpers.copyGroupsDataToProjectResources(toolName, groupsDataDirectory, params.bookAbbr);
      // read in the groupsData files
      let groupDataFolderObjs = fs.readdirSync(groupsDataDirectory);
      // read in the groupsData files
      allGroupsData = loadAllGroupsData(groupDataFolderObjs, groupsDataDirectory, dispatch, toolName);
      // then load groupsData to reducer
      dispatch({
        type: consts.LOAD_GROUPS_DATA_FROM_FS,
        allGroupsData
      });
      console.log('Generated and Loaded group data data from fs');
      resolve(true);
    }
  });
}


export function loadAllGroupsData(groupDataFolderObjs, groupsDataDirectory, dispatch, toolName) {
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
    dispatch(LoaderActions.sendProgressForKey(toolName, i / total * 100));
    i++;
  }
  return allGroupsData;
}

/**
 * @description helper function that loads a group data file
 * from the filesystem.
 * @param {string} groupName - group data name.
 * @param {string} groupDataFolderPath - group data save location in the filesystem.
 * @return {object} object action / Promises.
 */
export function loadGroupData(groupName, groupDataFolderPath) {
  const groupPath = path.join(groupDataFolderPath, groupName + '.json');
  let groupData;
  try {
    groupData = fs.readJsonSync(groupPath);
  } catch (err) {
    console.warn('failed loading group data for ' + groupName);
  }
  return groupData;
}
