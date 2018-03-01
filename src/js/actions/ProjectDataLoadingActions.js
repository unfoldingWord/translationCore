/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import types from './ActionTypes';
import {getTranslate} from '../selectors';
import ospath from 'ospath';
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
    const translate = getTranslate(getState());
    return new Promise(() => {
      let { projectDetailsReducer } = getState();
      let { projectSaveLocation, manifest } = projectDetailsReducer;
      let bookAbbreviation = manifest.project.id;
      const gatewayLanguage = projectDetailsReducer.currentProjectToolsSelectedGL[currentToolName]?projectDetailsReducer.currentProjectToolsSelectedGL[currentToolName]:'en';
      const dataDirectory = path.join(projectSaveLocation, '.apps', 'translationCore', 'index', currentToolName);
      const toolResourceDirectory = path.join(ospath.home(), 'translationCore', 'resources', gatewayLanguage, 'translationHelps', currentToolName);
      const versionDirectory = ResourcesHelpers.getLatestVersionInPath(toolResourceDirectory);
      const glDataDirectory = path.join(versionDirectory, 'kt');

      return getGroupsIndex(dispatch, glDataDirectory)
          .then(() => {
              return getGroupsData(dispatch, dataDirectory, currentToolName, bookAbbreviation)
                  .then(() => {
                    dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
                    dispatch({ type: types.TOGGLE_LOADER_MODAL, show: false });
                    dispatch(BodyUIActions.toggleHomeView(false));
                  });
          });
    })
    .catch(err => {
      console.warn(err);
      AlertModalActions.openAlertDialog(translate('home.project.error_loading', {email: translate('_.help_desk_email')}));
    });
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group index data path location in the filesystem.
 * @return {object} object action / Promises.
 */
function getGroupsIndex(dispatch, dataDirectory) {
  return new Promise((resolve) => {
    const groupIndexDataDirectory = path.join(dataDirectory, 'index.json');
    let groupIndexData;
    try {
      groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
      dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
      resolve(true);
    } catch (err) {
      console.log('No GL based index found for tool, will use a generated chapterGroupsIndex.');
      groupIndexData = ResourcesHelpers.chapterGroupsIndex();
      dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
      resolve(true);
    }
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {String} dataDirectory - group data path or save location in the filesystem.
 * @param {String} currentToolName - name if the tool being loaded.
 * @param {String} bookAbbreviation - book abbreviation stinrg.
 * @return {object} object action / Promises.
 */
export function getGroupsData(dispatch, dataDirectory, currentToolName, bookAbbreviation) {
  return new Promise((resolve) => {
    let groupsDataDirectory = path.join(dataDirectory, bookAbbreviation);
    if (fs.existsSync(groupsDataDirectory)) {
      // read in the groupsData files and load groupsData to reducer
      loadAllGroupsData(groupsDataDirectory, currentToolName, dispatch);
      resolve(true);
    } else {
      // The groups data files were not found in the directory thus copy
      // them from User resources folder to project resources folder.
      ResourcesHelpers.copyGroupsDataToProjectResources(currentToolName, groupsDataDirectory, bookAbbreviation);
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
    type: types.LOAD_GROUPS_DATA_FROM_FS,
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
