/**
 * @file These are the actions that load a tC project from
 * the manifest.json to the tools being loaded into the store
 * @author RoyalSix (I ate Seven) and Manny Colon
 * @exports GetData Actions
 * @version 1.0.0
 */

import fs from 'fs-extra';
import Path from 'path-extra';
import usfm from 'usfm-parser';
import BOOKS from '../components/BooksOfBible.js';
// actions
import consts from './ActionTypes';
import * as LoaderActions from './LoaderActions';
import * as AlertModalActions from './AlertModalActions';
import * as ResourcesActions from './ResourcesActions';
import * as ModalActions from './ModalActions';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as CurrentToolActions from './currentToolActions';
import * as GroupsDataActions from './GroupsDataActions';
import * as GroupsIndexActions from './GroupsIndexActions';
import * as BodyUIActions from './BodyUIActions';
import * as ModulesSettingsActions from './ModulesSettingsActions';
import * as projectDetailsActions from './projectDetailsActions';
import * as TargetLanguageActions from './TargetLanguageActions';
// constant declarations
const ORIGINAL_LANGUAGE_PATH = Path.join(window.__base, 'static/originalLanguage');

/**
 * @description Initiates the loading of a usfm file into current project, puts the target language, params,
 * save location, and manifest into the store.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openUSFMProject(usfmFilePath, projectPath, direction, projectLink, exporting) {
  return ((dispatch, getState) => {
    const { userdata } = getState().loginReducer;
    const currentUser = userdata ? userdata.username : null;
    const projectSaveLocation = LoadHelpers.saveProjectInHomeFolder(projectPath);
    dispatch(projectDetailsActions.setSaveLocation(projectSaveLocation));
    const usfmData = LoadHelpers.setUpUSFMProject(usfmFilePath, projectSaveLocation);
    const parsedUSFM = LoadHelpers.getParsedUSFM(usfmData);
    const targetLanguage = LoadHelpers.formatTargetLanguage(parsedUSFM);
    dispatch(ResourcesActions.addNewBible('targetLanguage', targetLanguage));
    dispatch(setUSFMParams(parsedUSFM.book, projectSaveLocation, direction));
    let manifest = LoadHelpers.loadFile(projectSaveLocation, 'manifest.json');
    if (!manifest) {
      const defaultManifest = LoadHelpers.setUpDefaultUSFMManifest(parsedUSFM, direction, currentUser);
      manifest = LoadHelpers.saveManifest(projectSaveLocation, projectLink, defaultManifest);
    }
    dispatch(addLoadedProjectToStore(projectSaveLocation, manifest));
    if (!exporting) dispatch(displayToolsToLoad(manifest));
  });
}

/**
 * @description hanldes manifest errors.
 * @param {string} content - Message of the alert to be shown
 * @return {object} action object.
 */
export function manifestError(content) {
  return (dispatch => {
    dispatch(
      AlertModalActions.openAlertDialog('Error Setting Up Project: \n' + content)
    );
    dispatch(clearPreviousData());
  });
}
/**
 * @description helper to delay actions to a specific number of ms.
 * @param {number} ms - miliseconds delay.
 * @return {*} none.
 */
const delay = (ms) => new Promise(resolve =>
  setTimeout(resolve, ms)
);

/**
 * @description Loads the tool into the main app view, and initates the
 * tool Container component
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 * @param {string} toolName - name of the current tool being loaded.
 * @return {object} action object.
 */
export function loadModuleAndDependencies(moduleFolderName, toolName) {
  return ((dispatch, getState) => {
    try {
      dispatch({ type: consts.START_LOADING });
      dispatch({ type: consts.CLEAR_CURRENT_TOOL });
      delay(1000)
        .then(() => {
          dispatch({ type: consts.CLEAR_PREVIOUS_DATA });
          dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
          dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
          dispatch({ type: consts.CLEAR_CONTEXT_ID });
          dispatch(CurrentToolActions.setToolName(toolName));
          dispatch(CurrentToolActions.setDataFetched(false));
          const modulePath = Path.join(moduleFolderName, 'package.json');
          const dataObject = fs.readJsonSync(modulePath);
          const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
          dispatch(saveModules(checkArray));
          dispatch(CurrentToolActions.setToolTitle(dataObject.title));
          delay(2000)
            .then(
            dispatch(loadProjectDataFromFileSystem(dataObject.name))
            );
        });
    } catch (e) {
      console.log(e);
      dispatch(errorLoadingProject(e));
    }
  });
}

/**
 * @description Saves tools included module Containers in the store
 * @param {Array} checkArray - Array of the checks that the views should be loaded.
 * @return {object} action object.
 */
export function saveModules(checkArray) {
  return (dispatch => {
    for (let module of checkArray) {
      try {
        const viewObj = require(Path.join(module.location, 'Container'));
        const moduleFetchData = viewObj.fetchData;
        if (moduleFetchData) {
          dispatch(saveModuleFetchData(moduleFetchData));
        }
        dispatch(setModuleView(module.name, viewObj.view || viewObj.container));
      } catch (e) {
        console.log(e);
      }
    }
  });
}

/**
 * @description this function saves a modules fethdata files in the reducer.
 * @param {function} moduleFetchData - module fethdata code.
 * @return {object} action being dispatched.
 */
export function saveModuleFetchData(moduleFetchData) {
  return {
    type: consts.SAVE_MODULE_FETCHDATA,
    moduleFetchData
  };
}

/**
 * @description This method will set the corestore view for the corresponding module
 * @param {string} identifier - label/property name.
 * @param {object} view - tool component being saved.
 * @return {object} action being dispatched.
 */
export function setModuleView(identifier, view) {
  return {
    type: consts.SAVE_MODULE_VIEW,
    identifier: identifier,
    module: view
  };
}

/**
 * @description function that handles both loadGroupIndexFromFS and
 * loadGroupDataFromFS with promises.
 * @param {string} toolName - name of the tool being loaded.
 * @return {object} object action.
 */
function loadProjectDataFromFileSystem(toolName) {
  return ((dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let { toolsReducer, projectDetailsReducer } = getState();
      let { projectSaveLocation, params } = projectDetailsReducer;
      const dataDirectory = Path.join(projectSaveLocation, '.apps', 'translationCore', 'index', toolName);

      dispatch(TargetLanguageActions.generateAndLoadTargetLangBible(projectSaveLocation));
      loadGroupIndexFromFS(dispatch, dataDirectory)
        .then((successMessage) => {
          loadGroupDataFromFS(dispatch, dataDirectory, toolName, params)
          .then((successMessage) => {
            let delayTime = 0;
            // if (successMessage === "success") {
            //   dispatch(ResourcesActions.loadBiblesFromFS());
            //   delayTime = 800;
            // }
            // if (toolsReducer.switchingTool) {
            //   // Switching project and/or tool
            //   dispatch(startModuleFetchData())
            // }
            delay(delayTime)
              .then(
                // TODO: this action may stay here temporary until the home screen implementation.
                dispatch(BodyUIActions.toggleHomeView(false))
              )
              .then(dispatch({ type: consts.DONE_LOADING }))
          })

            .catch(err => {
              console.warn(err);
              // TODO: this action may stay here temporary until the home screen implementation.
              dispatch(BodyUIActions.toggleHomeView(false));
              AlertModalActions.openAlertDialog("Oops! We have encountered a problem loading your project. Please contact Help Desk (help@door43.org) for assistance.");
            });
        })

        .catch(err => {
          console.warn(err);
          // TODO: this action may stay here temporary until the home screen implementation.
          dispatch(BodyUIActions.toggleHomeView(false));
          AlertModalActions.openAlertDialog("Oops! We have encountered a problem loading your project. Please contact Help Desk (help@door43.org) for assistance.");
        });
    });
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group index data path
 * location in the filesystem.
 * @return {object} object action / Promises.
 */
function loadGroupIndexFromFS(dispatch, dataDirectory) {
  return new Promise((resolve, reject) => {
    const groupIndexDataDirectory = Path.join(dataDirectory, 'index.json');
    let groupIndexData;
    if (fs.existsSync(groupIndexDataDirectory)) {
      try {
        groupIndexData = fs.readJsonSync(groupIndexDataDirectory);
        dispatch(GroupsIndexActions.loadGroupsIndexFromFS(groupIndexData));
        console.log('Loaded group index data from fs');
        resolve("success");
      } catch (err) {
        console.log(err);
        resolve();
      }
    } else {
      console.log("No directory for group index was found.")
      resolve();
    }
  });
}

/**
 * @description loads the group index from the filesystem.
 * @param {function} dispatch - redux action dispatcher.
 * @param {string} dataDirectory - group data path or save
 * location in the filesystem.
 * @param {string} toolName - name if the tool being loaded.
 * @param {object} params - object of project details params.
 * @return {object} object action / Promises.
 */
function loadGroupDataFromFS(dispatch, dataDirectory, toolName, params) {
  return new Promise((resolve, reject) => {
    let groupDataDirectory = Path.join(dataDirectory, params.bookAbbr);
    if (fs.existsSync(groupDataDirectory)) {
      let groupDataFolderObjs = fs.readdirSync(groupDataDirectory);
      let allGroupsData = {};
      let total = groupDataFolderObjs.length;
      let i = 0;
      for (let groupId in groupDataFolderObjs) {
        if (Path.extname(groupDataFolderObjs[groupId]) !== '.json') {
          total--;
          continue;
        }
        let groupName = groupDataFolderObjs[groupId].split('.')[0];
        let groupData = loadGroupData(groupName, groupDataDirectory);
        if (groupData) {
          allGroupsData[groupName] = groupData;
        }
        dispatch(LoaderActions.sendProgressForKey(toolName, i / total * 100));
        i++;
      }
      dispatch({
        type: consts.LOAD_GROUPS_DATA_FROM_FS,
        allGroupsData
      });
      dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
      console.log('Loaded group data from fs');
      resolve(true);
    } else {
      console.log("No directory for groups data was found.")
      resolve(false);
    }
  });
}

/**
 * @description helper function that loads a group data file
 * from the filesystem.
 * @param {string} groupName - group data name.
 * @param {string} groupDataFolderPath - group data save location
 * in the filesystem.
 * @return {object} object action / Promises.
 */
function loadGroupData(groupName, groupDataFolderPath) {
  const groupPath = Path.join(groupDataFolderPath, groupName + '.json');
  let groupData;
  try {
    groupData = fs.readJsonSync(groupPath);
  } catch (err) {
    console.warn('failed loading group data for ' + groupName);
  }
  return groupData;
}

/**
<<<<<<< HEAD
 * @description this function handles running the tools fetchdata when needed.
 * @return {object} action object.
 */
export function startModuleFetchData() {
  return ((dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let {
        coreStoreReducer,
        projectDetailsReducer,
        resourcesReducer,
        modulesSettingsReducer,
        groupsDataReducer,
        groupsIndexReducer
      } = getState();

      let currentModuleFetchData = coreStoreReducer.currentModuleFetchData;

      const addNewBible = (bibleName, bibleData) => {
        dispatch(ResourcesActions.addNewBible(bibleName, bibleData));
      };
      const setModuleSettings = (NAMESPACE, settingsPropertyName, moduleSettingsData) => {
        dispatch(ModulesSettingsActions.setModuleSettings(NAMESPACE, settingsPropertyName, moduleSettingsData));
      };
      const progress = (label, progress) => {
        dispatch(LoaderActions.sendProgressForKey(label, progress));
      };
      const addGroupData = (groupId, groupData) => {
        dispatch(GroupsDataActions.addGroupData(groupId, groupData));
      };
      const setGroupsIndex = (groupsIndex) => {
        dispatch(GroupsIndexActions.setGroupsIndex(groupsIndex));
      };
      const setProjectDetail = (key, value) => {
        dispatch(projectDetailsActions.setProjectDetail(key, value));
      };

      let props = {
        actions: {
          addNewBible,
          setModuleSettings,
          progress,
          addGroupData,
          setGroupsIndex,
          setProjectDetail
        },
        projectDetailsReducer,
        resourcesReducer,
        progress,
        modulesSettingsReducer,
        groupsDataReducer,
        groupsIndexReducer
      };

      currentModuleFetchData(props)
        .then(dispatch({ type: consts.DONE_LOADING }))
        .then(() => {
          // TODO: this action may stay here temporary until the home screen implementation.
          dispatch(BodyUIActions.toggleHomeView(false));
          resolve();
        })
        .then(() => {
          dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
          resolve();
        });
    });
  });
}

/**
=======
>>>>>>> develop
 * @description handles erros when loading a project.
 * @param {object} err - Message object of the alert to be shown
 * @return {object} action object.
 */
export function errorLoadingProject(err) {
  return ((dispatch) => {
    dispatch({ type: consts.DONE_LOADING });
    dispatch(
      AlertModalActions.openAlertDialog(
        "Problem Loading Your Project" + err.message
      )
    );
    dispatch(clearPreviousData());
    console.error(err);
  });
}

/**
 * @description Set ups a tC project parameters for a usfm project
 * @param {string} bookAbbr - Book abbreviation
 * @param {path} projectSaveLocation - Path of the usfm project being loaded
 * @param {path} direction - Reading direction of the project books
 * @return {object} action object.
 */
export function setUSFMParams(bookAbbr, projectSaveLocation, direction) {
  return ((dispatch) => {
    let params = {
      originalLanguagePath: ORIGINAL_LANGUAGE_PATH,
      targetLanguagePath: projectSaveLocation,
      direction: direction,
      bookAbbr: bookAbbr
    };
    if (LoadHelpers.isOldTestament(bookAbbr)) {
      params.originalLanguage = "hebrew";
    } else {
      params.originalLanguage = "greek";
    }
    dispatch(projectDetailsActions.setProjectParams(params));
  });
}
