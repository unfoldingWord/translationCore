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
import * as ModulesSettingsActions from '../actions/ModulesSettingsActions';
import * as projectDetailsActions from '../actions/projectDetailsActions';
import { resetProjectDetail } from './projectDetailsActions';

// constant declarations
const PARENT = Path.datadir('translationCore');
const PACKAGE_COMPILE_LOCATION = Path.join(PARENT, 'packages-compiled');
const PACKAGE_SUBMODULE_LOCATION = Path.join(window.__base, 'tC_apps');
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore');
const extensionRegex = new RegExp('(\\.\\w+)', 'i');
const ORIGINAL_LANGUAGE_PATH = Path.join(window.__base, 'static/taggedULB');



/**
 * @description Sends project path to the store
 */
export function setProjectPath(pathLocation) {
  return {
    type: consts.SET_SAVE_PATH_LOCATION,
    pathLocation: pathLocation
  };
}

/**
 * @description Sends project manifest to the store
 */
export function setProjectManifest(manifest) {
  return {
    type: consts.STORE_MANIFEST,
    manifest: manifest
  }
}

/**
 * @description Sends project parameters to the store
 */
export function setProjectParams(params) {
  return {
    type: consts.STORE_PARAMS,
    params: params
  }
}

/**
 * @description This method will set the corestore reducer store state back to the inital state.
 *
 */
export function clearPreviousData() {
  return ((dispatch) => {
    dispatch(resetProjectDetail());
    dispatch({ type: consts.CLEAR_OLD_GROUPS });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch(CurrentToolActions.setToolTitle(""));
    dispatch(saveModuleFetchData(null));
  })
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
      if (!manifest || !manifest.tcInitialized) {
        manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, currentUser);
      } else {
        let oldManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
        if (oldManifest) {
          manifest = LoadHelpers.setUpManifest(projectPath, projectLink, oldManifest, currentUser);
        }
      }
      dispatch(addLoadedProjectToStore(projectPath, manifest));
      if (!exporting) dispatch(displayToolsToLoad(manifest));
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
    dispatch(setProjectPath(projectSaveLocation));
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
    dispatch(setProjectPath(projectPath));
    dispatch(setProjectManifest(manifest));
    dispatch(projectDetailsActions.setProjectDetail("bookName", manifest.project.name));
    const params = LoadHelpers.getParams(projectPath, manifest);
    if (params) {
      dispatch(setProjectParams(params));
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
      dispatch(AlertModalActions.openAlertDialog('You can only load Ephisians or Titus projects for now.', 5));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
      dispatch(clearPreviousData());
    }
  });
}




/**
 *
 * @param {string} content - Message of the alert to be shown
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
 */
const delay = (ms) => new Promise(resolve =>
  setTimeout(resolve, ms)
);

/**
 * @description Loads the tool into the main app view, and initates the tool Container component
 *
 * @param {string} moduleFolderName - Folder path of the tool being loaded
 */
export function loadModuleAndDependencies(moduleFolderName) {
  return ((dispatch, getState) => {
    try {
      dispatch({ type: consts.START_LOADING });
      delay(2000)
        .then(() => {
          dispatch({ type: consts.CLEAR_OLD_GROUPS });
          dispatch({ type: consts.CLEAR_CONTEXT_ID });
          dispatch(CurrentToolActions.setDataFetched(false));
          const modulePath = Path.join(moduleFolderName, 'package.json');
          const dataObject = fs.readJsonSync(modulePath);
          const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
          dispatch(saveModules(checkArray));
          dispatch(CurrentToolActions.setToolTitle(dataObject.title));
          delay(3000)
            .then(
              dispatch(loadProjectDataFromFileSystem(dataObject.name))
            );
        });
    } catch (e) {
      console.log(e)
      dispatch(errorLoadingProject(e));
    }
  });
}

/**
 * @description Saves tools included module Containers in the store
 * @param {Array} checkArray - Array of the checks that the views should be loaded
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
 * @param identifier
 * @param view
 * @return action being dispatched.
 */
export function setModuleView(identifier, view) {
  return {
    type: consts.SAVE_MODULE_VIEW,
    identifier: identifier,
    module: view
  };
}

// new implemention
function loadProjectDataFromFileSystem(toolName) {
  return ((dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let { projectSaveLocation, params } = getState().projectDetailsReducer;
      const dataDirectory = Path.join(projectSaveLocation, 'apps', 'translationCore', 'index', toolName);

      loadGroupIndexFromFS(dispatch, dataDirectory)
        .then((successMessage) => {
          loadGroupDataFromFS(dispatch, dataDirectory, getState, params)
          .then((successMessage) => {
            let delayTime = 0;
            if (successMessage === "success") {
              dispatch(ResourcesActions.loadBiblesFromFS());
              delayTime = 1000;
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
          });
        })

        .catch(err => {
          console.warn(err);
        });
    });
  });
}

//// new implementation
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
        console.log(err)
        dispatch(startModuleFetchData());
      }
    } else {
      dispatch(startModuleFetchData());
    }
  });
}

// new implementation
function loadGroupDataFromFS(dispatch, dataDirectory, getState, params) {
  return new Promise((resolve, reject) => {
    let toolName = getState().currentToolReducer.toolName;
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
      console.log('Loaded group data from fs');
      resolve("success");
    } else {
      console.log("hey fetch data start")
      dispatch(startModuleFetchData());
    }
  });
}


/**
 *       (err, groupDataFolderObjs) => {
        if (err) {
          console.warn('Failed loading group data')
          reject(err);
          // take a second look at the reject above just in case
        } else {
 */

// new implementation helper
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
 * @description
 * 
 */
export function startModuleFetchData() {
  return ((dispatch, getState) => {
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

    currentModuleFetchData(props).then(dispatch({type: consts.DONE_LOADING}));
    dispatch(CurrentToolActions.setDataFetched(true));
    // TODO: this action may stay here temporary until the home screen implementation.
    dispatch(BodyUIActions.toggleHomeView(false));
  });
}

/**
 *
 * @param {object} err - Message object of the alert to be shown
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
    console.error(err)
  });
}



/**
 * @description Set ups a tC project parameters for a usfm project
 *
 * @param {string} bookAbbr - Book abbreviation
 * @param {path} projectSaveLocation - Path of the usfm project being loaded
 * @param {path} direction - Reading direction of the project books
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
    dispatch(setProjectParams(params));
  });
}
