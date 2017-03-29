/**
 * @file These are the actions that load a tC project from
 * the manifest.json to the tools being loaded into the store
 * @author RoyalSix (I ate Seven)
 *
 * @exports GetData Actions
 * @version 1.0.0
 */

import React from 'react'
import * as fs from 'fs-extra';
import * as consts from './CoreActionConsts';
import * as CoreActionsRedux from './CoreActionsRedux';
import * as LoaderActions from './LoaderActions';
import * as AlertModalActions from './AlertModalActions';
import * as ResourcesActions from './ResourcesActions';
import * as CheckStoreActions from './CheckStoreActions';
import * as NotificationActions from './NotificationActions';
import * as ModalActions from './ModalActions';
import * as ToolsActions from './ToolsActions';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as RecentProjectsActions from './RecentProjectsActions';

import pathex from 'path-extra';
import usfm from 'usfm-parser';
import { remote } from 'electron';
import BOOKS from '../components/core/BooksOfBible.js';
import Path from 'path';
import GIT from '../components/core/GitApi.js';

const api = window.ModuleApi;
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
    return {
        type: consts.CLEAR_PREVIOUS_DATA
    }
}

/**
 * @description This method will set the corestore view for the corresponding module
 * 
 */
export function setModuleView(identifier, view){
    return {
        type: consts.SAVE_MODULE_VIEW,
        identifier: identifier,
        module:view
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
        const currentUser = getCurrentUser(getState());
        const usfmFilePath = LoadHelpers.checkIfUSFMFileOrProject(projectPath);
        let manifest;

        if (usfmFilePath) {
            //USFM detected, initiating separate loading process
            dispatch(openUSFMProject(usfmFilePath, projectPath, 'ltr', projectLink, currentUser));
        } else {
            //No USFM detected, initiating 'standard' loading process
            projectPath = LoadHelpers.correctSaveLocation(projectPath);
            manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
            if (!manifest && !manifest.tcInitialized) {
                manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, currentUser);
            } else {
                let oldManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
                if (oldManifest) {
                    manifest = LoadHelpers.setUpManifest(projectPath, oldManifest);
                }
            }
            dispatch(addLoadedProjectToStore(projectPath, manifest));
        }
        dispatch(displayToolsToLoad(manifest));
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
            const book = LoadHelpers.convertToFullBookName(params.bookAbbr);
            dispatch(CheckStoreActions.setBookName(book));
        } else {
            //no finished_chunks in manifest
            dispatch(manifestError('No finished chunks specified in project manifest'))
        }
        dispatch(loadProjectDataFromFileSystem(projectPath));
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
 * @description Loaded previous project data into the filesystem given a path.
 * 
 * @param {string} projectPath - Path in which the project is being loaded from 
 */
export function loadProjectDataFromFileSystem(projectPath) {
    return ((dispatch) => {
        //TODO retrieve previous project data to put in store
    });
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
    return ((dispatch) => {
        try {
            dispatch({ type: consts.START_LOADING });
            const modulePath = Path.join(moduleFolderName, 'package.json');
            const dataObject = fs.readJsonSync(modulePath);
            const checkArray = LoadHelpers.createCheckArray(dataObject, moduleFolderName);
            dispatch(saveModules(checkArray));
            dispatch(CheckStoreActions.setCheckNameSpace(dataObject.name))
            dispatch(CoreActionsRedux.changeModuleView('main'));
        } catch (e) {
            dispatch(errorLoadingProject(e));
        }

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
