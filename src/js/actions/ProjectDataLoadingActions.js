/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import types from './ActionTypes';
import {getTranslate} from '../selectors';
import ospath from 'ospath';
import isEqual from 'deep-equal';
import { checkSelectionOccurrences } from 'selections';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as GroupsDataActions from './GroupsDataActions';
import * as GroupsIndexActions from './GroupsIndexActions';
import * as LoaderActions from './LoaderActions';
import * as BodyUIActions from './BodyUIActions';
import * as SelectionsActions from './SelectionsActions';
// helpers
import * as ResourcesHelpers from '../helpers/ResourcesHelpers';
import { loadCurrentContextId } from './ContextIdActions';
import * as ToolsMetadataHelpers from '../helpers/ToolsMetadataHelpers';

export function checkInvalidationsForAllTools() {
  // 1. Build Bible
  return ((dispatch, getState) => {
    const state = getState();
    const projectPath = state.projectDetailsReducer.projectSaveLocation;
    const bookId = state.projectDetailsReducer.manifest.project.id;
    const targetBiblePath = path.join(projectPath, bookId);
    let bibleData = {};
    const files = fs.readdirSync(targetBiblePath);
    for (let file of files) {
      if (path.extname(file) == '.json') {
        let chapter = parseInt(file);
        bibleData[chapter] = fs.readJsonSync(path.join(targetBiblePath, file));
      }
    }

    // 2. For each tool, get Groups Data and check verses
    const metadatas = ToolsMetadataHelpers.getToolsMetadatas();
    metadatas.forEach(async metadata => {
      let toolName = metadata.name;
      // 3. Get Groups Data
      const groupsDataDirectory = path.join(projectPath, '.apps', 'translationCore', 'index', toolName, bookId);
      if (! fs.existsSync(groupsDataDirectory)) {
        ResourcesHelpers.copyGroupsDataToProjectResources(toolName, groupsDataDirectory, bookId);
      }
      let groupDataFolderObjs = fs.readdirSync(groupsDataDirectory);
      let groupsData = {};
      for (let groupId in groupDataFolderObjs) {
        if (path.extname(groupDataFolderObjs[groupId]) !== '.json') {
          continue;
        }
        let groupName = groupDataFolderObjs[groupId].split('.')[0];
        let groupData = loadGroupData(groupName, groupsDataDirectory);
        if (groupData) {
          groupsData[groupName] = groupData;
        }
      }

      // 4. Check verses
      for (let chapter in bibleData) {
        for (let verse in bibleData[chapter]) {
          const verseText = bibleData[chapter][verse];
          const contextId = {
            reference: {
              bookId: bookId,
              chapter: parseInt(chapter),
              verse: parseInt(verse)
            }
          };

          const groupsDataForVerse = {};
          if (groupsData) {
            for (let groupItemKey of Object.keys(groupsData)) {
              const groupItem = groupsData[groupItemKey];
              if (groupItem) {
                for (let checkingOccurrence of groupItem) {
                  if (isEqual(checkingOccurrence.contextId.reference, contextId.reference)) {
                    if (!groupsDataForVerse[groupItemKey]) {
                      groupsDataForVerse[groupItemKey] = [];
                    }
                    groupsDataForVerse[groupItemKey].push(checkingOccurrence);
                  }
                }
              }
            }
          }
        
          for (let groupItemKey of Object.keys(groupsDataForVerse)) {
            const groupItem = groupsDataForVerse[groupItemKey];
            for (let checkingOccurrence of groupItem) {
              const selections = checkingOccurrence.selections;
              if (!SelectionsActions.sameContext(contextId, checkingOccurrence.contextId)) {
                if (selections && selections.length) {
                  const validSelections = checkSelectionOccurrences(bibleData[chapter][verse], selections);
                  if (selections.length !== validSelections.length) {
                    const {username} = state.userdata;
                    const modifiedTimestamp = (new Date()).toJSON();
                    const invalidted = {
                      contextId: contextId,
                      invalidated: true,
                      userName: username,
                      modifiedTimestamp: modifiedTimestamp,
                      gatewayLanguageCode: selectionsData.gatewayLanguageCode,
                      gatewayLanguageQuote: selectionsData.gatewayLanguageQuote
                    };
                    const newFilename = modifiedTimestamp + '.json';
                    const invalidatedCheckPath = path.join(projectSaveLocation, '.apps', 'translationCore', 'checkData', 'invalidated', bibleId, chapter.toString(), verse.toString());
                    fs.outputJSONSync(path.join(invalidatedCheckPath, newFilename.replace(/[:"]/g, '_')), invalidted);
          

                    
                    dispatch(changeSelections([], username, true, checkingOccurrence.contextId)); // clear selection
                  }
                }
              }
            }
          }
      
          dispatch(validateAllSelectionsForVerse(verseText, results, false, contextId));
          
        }
      }
    });
  });
}

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
      const versionDirectory = ResourcesHelpers.getLatestVersionInPath(toolResourceDirectory) || toolResourceDirectory;
      // if resource in the below path doesn't exist, an empty groups index will be generated by getGroupsIndex().
      // wordAlignment is a tool that this happens with.
      const glDataDirectory = path.join(versionDirectory, 'kt');

      debugger;
      return getGroupsIndex(dispatch, glDataDirectory, translate)
          .then(() => {
              return getGroupsData(dispatch, dataDirectory, currentToolName, bookAbbreviation)
                  .then(() => {
                    debugger;
                    dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
                    dispatch(loadCurrentContextId());
                    dispatch({ type: types.TOGGLE_LOADER_MODAL, show: false });
                    dispatch(BodyUIActions.toggleHomeView(false));
                  });
          });
    })
    .catch(err => {
      console.warn(err);
      AlertModalActions.openAlertDialog(translate('projects.error_loading', {email: translate('_.help_desk_email')}));
    });
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group index data path location in the filesystem.
 * @param {function} translate
 * @return {object} object action / Promises.
 */
function getGroupsIndex(dispatch, dataDirectory, translate) {
  return new Promise((resolve) => {
    const groupIndexDataDirectory = path.join(dataDirectory, 'index.json');
    let groupIndexData;
    try {
      groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
      dispatch(GroupsIndexActions.loadGroupsIndex(groupIndexData));
      resolve(true);
    } catch (err) {
      console.log('No GL based index found for tool, will use a generated chapterGroupsIndex.');
      groupIndexData = ResourcesHelpers.chapterGroupsIndex(translate);
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
export function loadAllGroupsData(groupsDataDirectory, currentToolName, dispatch) {
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
