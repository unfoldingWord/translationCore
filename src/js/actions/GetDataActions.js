/**
 * @file These are the actions that load a tC project from
 * the manifest.json to the tools being loaded into the store
 * @author RoyalSix (I ate Seven) and Manny Colon
 * @exports GetData Actions
 * @version 1.0.0
 */

import * as fs from 'fs-extra';
import Path from 'path-extra';
import usfm from 'usfm-parser';
import BOOKS from '../components/core/BooksOfBible.js';
// actions
import * as consts from './CoreActionConsts';
import * as LoaderActions from './LoaderActions';
import * as AlertModalActions from './AlertModalActions';
import * as ResourcesActions from './ResourcesActions';
import * as NotificationActions from './NotificationActions';
import * as ModalActions from './ModalActions';
import * as ToolsActions from './ToolsActions';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as RecentProjectsActions from './RecentProjectsActions';
import * as CurrentToolActions from './currentToolActions';
import * as GroupsDataActions from './GroupsDataActions';
import * as GroupsIndexActions from './GroupsIndexActions';
import * as BodyUIActions from './BodyUIActions';
import * as ModulesSettingsActions from './ModulesSettingsActions';
import * as projectDetailsActions from './projectDetailsActions';
// constant declarations
const PARENT = Path.datadir('translationCore');
const PACKAGE_COMPILE_LOCATION = Path.join(PARENT, 'packages-compiled');
const PACKAGE_SUBMODULE_LOCATION = Path.join(window.__base, 'tC_apps');
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore');
const extensionRegex = new RegExp('(\\.\\w+)', 'i');
const ORIGINAL_LANGUAGE_PATH = Path.join(window.__base, 'static/taggedULB');

/**
 * @description This method will set the corestore reducer store state back to the inital state.
 * @return {object} returns a bunch of action dispatch.
 */
export function clearPreviousData() {
  return ((dispatch) => {
    dispatch(projectDetailsActions.resetProjectDetail());
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLEAR_CURRENT_TOOL });
    dispatch({ type: consts.CLEAR_PREVIOUS_DATA });
    dispatch(CurrentToolActions.setToolTitle(""));
    dispatch(saveModuleFetchData(null));
  });
}

/**
 * @description Starter function to load a project from a folder path or link.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openProject(projectPath, projectLink, exporting = false) {
  return ((dispatch, getState) => {
    if (!projectPath && !projectLink) return;
    // TODO: this action may stay here temporary until the home screen implementation.
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch(clearPreviousData());
    const loginStore = getState().loginReducer;
    const currentUser = loginStore.userdata ? loginStore.userdata.username : null;
    const usfmFilePath = LoadHelpers.checkIfUSFMFileOrProject(projectPath);
    if (usfmFilePath) {
      // USFM detected, initiating separate loading process
      dispatch(openUSFMProject(usfmFilePath, projectPath, 'ltr', projectLink, currentUser, exporting));
    } else {
      // No USFM detected, initiating 'standard' loading process
      projectPath = LoadHelpers.correctSaveLocation(projectPath);
      let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
      manifest = LoadHelpers.verifyChunks(projectPath, manifest);
      LoadHelpers.migrateAppsToDotApps(projectPath);
      let conflictsFound = LoadHelpers.findMergeConflicts(manifest.finished_chunks, projectPath);
      if (conflictsFound) {
        dispatch(AlertModalActions.openAlertDialog("Oops! The project you are trying to load has a merge conflict and cannot be opened in this version of translationCore! Please contact Help Desk (help@door43.org) for assistance."));
        dispatch(clearPreviousData());
        return;
      }
      if (!manifest || !manifest.tcInitialized) {
        manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, currentUser);
      } else {
        let oldManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
        if (oldManifest) {
          manifest = LoadHelpers.setUpManifest(projectPath, projectLink, oldManifest, currentUser);
        }
      }
      if (LoadHelpers.checkMissingVerses(manifest.project.name, projectPath)) {
        dispatch(AlertModalActions.openOptionDialog('Oops! Your project has blank verses! Please contact Help Desk (help@door43.org) for assistance with fixing this problem. If you proceed without fixing, some features may not work properly', 
        (option)=> {
            if (option === "Cancel") {
                dispatch(clearPreviousData());
                dispatch(AlertModalActions.closeAlertDialog());
            } else {
                dispatch(AlertModalActions.closeAlertDialog());
                dispatch(addLoadedProjectToStore(projectPath, manifest));
                if (!exporting) dispatch(displayToolsToLoad(manifest));
            }
        }, "Continue Without Fixing", "Cancel"));
      } else {
        dispatch(addLoadedProjectToStore(projectPath, manifest));
        if (!exporting) dispatch(displayToolsToLoad(manifest));
      }
    }
  });
}

/**
 * @description Initiates the loading of a usfm file into current project, puts the target language, params,
 * save location, and manifest into the store.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openUSFMProject(usfmFilePath, projectPath, direction, projectLink, currentUser, exporting) {
  return ((dispatch) => {
    const projectSaveLocation = LoadHelpers.correctSaveLocation(projectPath);
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
 * @description Starts loading a project that has a standard manifest created.
 * Adds manifest, params, book name, and target language bible
 * (if usfm), and project data from file to store.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {object} manifest - Manifest specified for tC load
 */
export function addLoadedProjectToStore(projectPath, manifest) {
  return ((dispatch) => {
    dispatch(projectDetailsActions.setSaveLocation(projectPath));
    dispatch(projectDetailsActions.setProjectManifest(manifest));
    dispatch(projectDetailsActions.setProjectDetail("bookName", manifest.project.name));
    const params = LoadHelpers.getParams(projectPath, manifest);
    if (params) {
      dispatch(projectDetailsActions.setProjectParams(params));
    } else {
      // no finished_chunks in manifest
      dispatch(manifestError('No finished chunks specified in project manifest'))
    }
  });
}

/**
 * @description Displays the currently loaded tools in the app, if
 * project is a titus or ephisians, or if the userdata
 * is in developer mode.
 *
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function displayToolsToLoad(manifest) {
  return ((dispatch, getState) => {
    const currentState = getState();
    if (LoadHelpers.checkIfValidBetaProject(manifest) || (currentState.settingsReducer.currentSettings && currentState.settingsReducer.currentSettings.developerMode)) {
      dispatch(NotificationActions.showNotification('Info: Your project is ready to be loaded once you select a tool', 5));
      dispatch(ToolsActions.getToolsMetadatas());
      dispatch(ModalActions.selectModalTab(3, 1, true));
    } else {
      dispatch(AlertModalActions.openAlertDialog('You can only load Ephesians or Titus projects for now.', false));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
      dispatch(clearPreviousData());
    }
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
      let { projectSaveLocation, params } = getState().projectDetailsReducer;
      const dataDirectory = Path.join(projectSaveLocation, '.apps', 'translationCore', 'index', toolName);

      loadGroupIndexFromFS(dispatch, dataDirectory)
        .then((successMessage) => {
          loadGroupDataFromFS(dispatch, dataDirectory, toolName, params)
          .then((successMessage) => {
            let delayTime = 0;
            if (successMessage === "success") {
              dispatch(ResourcesActions.loadBiblesFromFS());
              delayTime = 800;
            }
            delay(delayTime)
              .then(
                // TODO: this action may stay here temporary until the home screen implementation.
                dispatch(BodyUIActions.toggleHomeView(false))
              )
              .then(dispatch({ type: consts.DONE_LOADING }));
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
        dispatch(startModuleFetchData()).then(successMessage => {
          resolve(successMessage);
        });
      }
    } else {
      dispatch(startModuleFetchData()).then(successMessage => {
        resolve(successMessage);
      });
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
      let allGroupsObjects = {};
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
          allGroupsObjects[groupName] = groupData;
        }
        dispatch(LoaderActions.sendProgressForKey(toolName, i / total * 100));
        i++;
      }
      dispatch(GroupsDataActions.loadGroupsDataFromFS(allGroupsObjects));
      dispatch(GroupsDataActions.verifyGroupDataMatchesWithFs());
      console.log('Loaded group data from fs');
      resolve("success");
    } else {
      dispatch(startModuleFetchData()).then(successMessage => {
        resolve(successMessage);
      });
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
      .then(dispatch({type: consts.DONE_LOADING}))
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
