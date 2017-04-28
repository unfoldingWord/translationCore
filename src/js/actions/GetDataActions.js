/**
 * @file These are the actions that load a tC project from
 * the manifest.json to the tools being loaded into the store
 * @author RoyalSix (I ate Seven)
 *
 * @exports GetData Actions
 * @version 1.0.0
 */

import React from 'react';
// actions
import * as fs from 'fs-extra';
import * as consts from './CoreActionConsts';
import * as CoreActionsRedux from './CoreActionsRedux';
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
import { resetProjectDetail } from './projectDetailsActions'

import pathex from 'path-extra';
import usfm from 'usfm-parser';
import { remote } from 'electron';
import BOOKS from '../components/core/BooksOfBible.js';
import Path from 'path';
import GIT from '../components/core/GitApi.js';

// constant declarations
const PARENT = pathex.datadir('translationCore');
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');
const PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');
const DEFAULT_SAVE = Path.join(pathex.homedir(), 'translationCore');
const { dialog } = remote;
const extensionRegex = new RegExp('(\\.\\w+)', 'i');
const ORIGINAL_LANGUAGE_PATH = Path.join(window.__base, 'static/taggedULB');



/**
 * @description Sends project path to the store
 */
export function setProjectPath(pathLocation) {
    return {
        type: consts.SET_SAVE_PATH_LOCATION,
        pathLocation: pathLocation
    }
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
    })
}

/**
 * @description This method will set the corestore view for the corresponding module
 *
 */
export function setModuleView(identifier, view) {
    return {
        type: consts.SAVE_MODULE_VIEW,
        identifier: identifier,
        module: view
    }
}


/**
 * @description Returns the current user logged in from the current app state,
 * not meant to be used outside of an action
 *
 * @requires not a dispatch function
 * @param {object} state
 */
export function getCurrentUser(state) {
    const loginStore = state.loginReducer;
    const currentUser = loginStore.userdata ? loginStore.userdata.username : null;
    return currentUser;
}

/**
 * @description Starter function to load a project from a folder path or link.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openProject(projectPath, projectLink) {
    return ((dispatch, getState) => {
        if (!projectPath && !projectLink) return;
        dispatch(clearPreviousData());
        const currentUser = getCurrentUser(getState());
        const usfmFilePath = LoadHelpers.checkIfUSFMFileOrProject(projectPath);
        if (usfmFilePath) {
            //USFM detected, initiating separate loading process
            dispatch(openUSFMProject(usfmFilePath, projectPath, 'ltr', projectLink, currentUser));
        } else {
            //No USFM detected, initiating 'standard' loading process
            let manifest = setUpManifestAndParams(projectPath, projectLink, currentUser);
            dispatch(addLoadedProjectToStore(projectPath, manifest));
            dispatch(displayToolsToLoad(manifest));
        }
    });
}

export function setUpManifestAndParams(projectPath, projectLink, currentUser) {
    projectPath = LoadHelpers.correctSaveLocation(projectPath);
    let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    manifest = LoadHelpers.verifyChunks(projectPath, manifest);
    if (!manifest && !manifest.tcInitialized) {
        manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, currentUser);
    } else {
        let oldManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
        if (oldManifest) {
            manifest = LoadHelpers.setUpManifest(projectPath, projectLink, oldManifest, currentUser);
        }
    }
    return manifest;
}

/**
 * @description Initiates the loading of a usfm file into current project, puts the target language, params,
 * save location, and manifest into the store.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openUSFMProject(usfmFilePath, projectPath, direction, projectLink, currentUser) {
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
        dispatch(displayToolsToLoad(manifest));
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
        const params = LoadHelpers.getParams(projectPath, manifest);
        if (params) {
            dispatch(setProjectParams(params));
        } else {
            //no finished_chunks in manifest
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
            dispatch({ type: consts.SHOW_APPS, val: true });
            dispatch(ToolsActions.getToolsMetadatas());
            dispatch(ModalActions.selectModalTab(3, 1, true));
        } else {
            dispatch(NotificationActions.showNotification('You can only load Ephisians or Titus projects for now.', 5));
            dispatch(RecentProjectsActions.getProjectsFromFolder());
            dispatch(clearPreviousData());
        }
    })
}




/**
 *
 * @param {string} content - Message of the alert to be shown
 */
export function manifestError(content) {
    return ((dispatch) => {
        AlertModalActions.showAlert(
            {
                title: 'Error Setting Up Project',
                content: content,
                moreInfo: "",
                leftButtonText: "Ok"
            });
        dispatch(clearPreviousData());
    });
}


/**
 * @description Loads the tool into the main app view, and initates the tool Container component
 *
 * @param {string} moduleFolderName - Folder path of the tool being loaded
 */
export function loadModuleAndDependencies(moduleFolderName) {
    return ((dispatch, getState) => {
        try {
            dispatch({ type: consts.CLEAR_CURRENT_TOOL });
            dispatch({ type: consts.CLEAR_OLD_GROUPS });
            dispatch({ type: consts.CLEAR_CONTEXT_ID });
            dispatch(CoreActionsRedux.changeModuleView());
            dispatch({ type: consts.START_LOADING });
            dispatch(CurrentToolActions.setDataFetched(false));
            const modulePath = Path.join(moduleFolderName, 'package.json');
            const dataObject = fs.readJsonSync(modulePath);
            const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
            dispatch(saveModules(checkArray));
            dispatch(CurrentToolActions.setToolName(dataObject.name));
            dispatch(CurrentToolActions.setToolTitle(dataObject.title));
            dispatch(loadGroupDataFromFileSystem(dataObject.name));
        } catch (e) {
            dispatch(errorLoadingProject(e));
        }

    });
}

/*
 * @description Loaded previous project data into the filesystem given a path.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function loadGroupDataFromFileSystem(toolName) {
    return ((dispatch, getState) => {
        const projectDetailsStore = getState().projectDetailsReducer;
        let { projectSaveLocation, params } = projectDetailsStore;
        let dataFolder = Path.join(projectSaveLocation, 'apps', 'translationCore', 'index', toolName);
        try {
            dispatch(setGroupIndexInStore(dataFolder, params));
        } catch (e) {
            console.warn('failed loading group index')
            dispatch(CoreActionsRedux.changeModuleView('main'));
        }
    });
}

export function setGroupDataInStore(dataFolder, params) {
    return ((dispatch) => {
        let groupDataFolderPath = Path.join(dataFolder, params.bookAbbr);
        fs.readdir(groupDataFolderPath, (err, groupDataFolderObjs) => {
            if (!err) {
                var allGroupsObjects = {};
                var total = groupDataFolderObjs.length;
                var i = 0;
                for (var groupId in groupDataFolderObjs) {
                    if (Path.extname(groupDataFolderObjs[groupId]) != '.json') {
                        total--;
                        continue;
                    }
                    let groupName = groupDataFolderObjs[groupId].split('.')[0];
                    const saveGroup = (groupName, groupDataFolderPath) => {
                        const groupPath = Path.join(groupDataFolderPath, groupName + '.json');
                        fs.readJson(groupPath, (err, groupObj) => {
                            if (!err) {
                                allGroupsObjects[groupName] = groupObj;
                                setTimeout(() => {
                                    dispatch(LoaderActions.sendProgressForKey(i / total * 100));
                                    i++;
                                    if (i >= total) {
                                        dispatch(GroupsDataActions.loadGroupsDataFromFS(allGroupsObjects));
                                        dispatch(CoreActionsRedux.changeModuleView('main'));
                                        console.log('Loaded group data from fs');
                                    }
                                }, 1)
                            } else {
                                console.warn('failed loading group data for ' + groupName);
                                total--;
                            }
                        });
                    }
                    saveGroup(groupName, groupDataFolderPath);
                }
            } else {
                console.warn('failed loading group data')
                dispatch(CoreActionsRedux.changeModuleView('main'));
            }
        });
    });
}

export function setGroupIndexInStore(dataFolder, params) {
    return ((dispatch) => {
        const pathToRead = Path.join(dataFolder, 'index.json');
        fs.readJson(pathToRead, (err, groupIndexObj) => {
            if (!err && groupIndexObj.length != 0) {
                dispatch(GroupsIndexActions.loadGroupsIndexFromFS(groupIndexObj));
                console.log('Loaded group index from fs');
            } else console.warn('failed loading group index')
            dispatch(setGroupDataInStore(dataFolder, params));
        });
    });
}

/**
 * @description Saves tools included module Containers in the store
 *
 * @param {Array} checkArray - Array of the checks that the views should be loaded
 */
export function saveModules(checkArray) {
    return ((dispatch) => {
        for (let module of checkArray) {
            try {
                const viewObj = require(Path.join(module.location, 'Container'));
                dispatch(setModuleView(module.name, viewObj.view || viewObj.container));
            } catch (e) {
                console.log(e);
            }
        }
    });
}

/**
 *
 * @param {object} err - Message object of the alert to be shown
 */
export function errorLoadingProject(err) {
    return ((dispatch) => {
        dispatch({ type: consts.DONE_LOADING });
        const alertMessage = {
            title: "Problem Loading Your Project",
            content: err.message,
            leftButtonText: "Ok",
            moreInfo: err,
            visibility: true,
        }
        dispatch(AlertModalActions.showAlert(alertMessage));
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
