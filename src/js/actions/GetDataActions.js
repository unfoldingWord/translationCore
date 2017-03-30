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
 * @description Formats and saves manifest according to tC standards, 
 * if not already done so
 * 
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 * @param {object} manifest - Default manifest given in order to load a non-usfm project
 */
export function setUpManifest(projectPath, projectLink, manifest, currentUser) {
    const verifiedManifest = verifyChunks(projectPath, manifest);
    let newManifest = LoadHelpers.saveManifest(projectPath, projectLink, verifiedManifest, currentUser);
    return newManifest;
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
 * @description Stores the project path loaded into the default tC folder 
 * location. If the project is exists in the default save location and it is
 * loaded from some place else, user will be prompted to overwrite it. Which results
 * in a deletion of the non-tC folder loaction project.
 * 
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function correctSaveLocation(projectPath) {
    const parsedPath = pathex.parse(projectPath);
    const tCProjectsSaveLocation = pathex.join(DEFAULT_SAVE, parsedPath.name);
    if (!fs.existsSync(projectPath)) {
        return false;
    }
    if (fs.existsSync(tCProjectsSaveLocation)) {
        if (projectPath != tCProjectsSaveLocation) {
            const continueCopy = confirm("This project is saved elsewhere on your computer. \nDo you want to overwrite it?");
            if (continueCopy) {
                fs.removeSync(tCProjectsSaveLocation);
                fs.copySync(projectPath, tCProjectsSaveLocation);
            }
            return tCProjectsSaveLocation;
        } else {
            return projectPath;
        }
    } else {
        fs.copySync(projectPath, tCProjectsSaveLocation);
        return projectPath;
    }
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
        const usfmFilePath = checkIfUSFMFileOrProject(projectPath);
        let manifest;

        if (usfmFilePath) {
            //USFM detected, initiating separate loading process
            dispatch(openUSFMProject(usfmFilePath, projectPath, 'ltr', projectLink, currentUser));
        } else {
            //No USFM detected, initiating 'standard' loading process
            projectPath = correctSaveLocation(projectPath);
            manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
            if (!manifest && !manifest.tcInitialized) {
                manifest = setUpManifest(projectPath, projectLink, manifest, currentUser);
            } else {
                let oldManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
                if (oldManifest) {
                    manifest = setUpManifest(projectPath, oldManifest);
                }
            }
            dispatch(addLoadedProjectToStore(projectPath, manifest));
        }
        dispatch(displayToolsToLoad(manifest));
    });
}

/**
 * @description Sets up the folder in the tC save location for a USFM project
 * 
 * @param {string} usfmFilePath - Path of the usfm file that has been loaded
 * @param {string} projectSaveLocation - Folder path containing the usfm file loaded
 */
export function setUpUSFMProject(usfmFilePath, projectSaveLocation) {
    const parsedPath = pathex.parse(usfmFilePath);
    const saveFile = Path.join(projectSaveLocation, parsedPath.base);
    const usfmData = fs.readFileSync(usfmFilePath).toString();
    fs.ensureDirSync(projectSaveLocation);
    fs.writeFileSync(saveFile, usfmData);
    return usfmData
}

/**
 * @description Sets up a USFM project manifest according to tC standards.
 * 
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {objet} user - The current user loaded
 */
export function setUpDefaultUSFMManifest(parsedUSFM, direction, user) {
    const name = user.username;
    const defaultManifest = {
        "source_translations": [
            {
                "language_id": "en",
                "resource_id": "ulb",
                "checking_level": "",
                "date_modified": new Date(),
                "version": ""
            }
        ],
        target_language: {
            direction: direction,
            id: "",
            name: name
        },
        project_id: parsedUSFM.book,
        ts_project: {
            id: parsedUSFM.book,
            name: LoadHelpers.convertToFullBookName(parsedUSFM.book)
        }
    }
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
        const projectSaveLocation = correctSaveLocation(projectPath);
        dispatch(setProjectPath(projectSaveLocation));
        const usfmData = setUpUSFMProject(usfmFilePath, projectSaveLocation);
        const parsedUSFM = getParsedUSFM(usfmData);
        const targetLanguage = formatTargetLanguage(parsedUSFM);
        dispatch(ResourcesActions.addNewBible('targetLanguage', targetLanguage));
        setUSFMParams(parsedUSFM.book, projectSaveLocation, direction);
        let manifest = LoadHelpers.loadFile(projectSaveLocation, 'manifest.json');
        if (!manifest) {
            const defaultManifest = setUpDefaultUSFMManifest(parsedUSFM, direction, currentUser);
            manifest = LoadHelpers.saveManifest(projectSaveLocation, projectLink, defaultManifest);
        }
        dispatch(addLoadedProjectToStore(projectSaveLocation, manifest));
    });
}

/**
 * @description Parses the usfm file using usfm-parse library.
 * 
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmData) {
    try {
        let parsedUSFM = usfm.toJSON(usfmData);
        parsedUSFM.book = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
        return parsedUSFM;
    } catch (e) {
        console.error(e);
    }
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
        const params = getParams(projectPath, manifest);
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
 * @description Check if project is ephesians or titus, or if user is in developer mode.
 * 
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function checkIfValidBetaProject(manifest) {
    if (manifest && manifest.project) return manifest.project.id == "eph" || manifest.project.id == "tit";
    else if (manifest && manifest.ts_project) return manifest.ts_project.id == "eph" || manifest.ts_project.id == "tit";
}

/**
 * @description This methods will set the corestore reducer store state back to the inital state.
 * 
 */
export function clearPreviousData() {
    return {
        type: consts.CLEAR_PREVIOUS_DATA
    }
}

/**
 * @description Formats a default manifest according to tC standards
 * 
 * @param {string} path - Path in which the project is being loaded from, also should contain
 * the target language.
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function getParams(path, manifest) {
    const isArray = (a) => {
        return (!!a) && (a.constructor === Array);
    }
    if (manifest.package_version == '3') {
        manifest = fixManifestVerThree(manifest);
    }
    if (manifest.finished_chunks && manifest.finished_chunks.length == 0) {
        return null;
    }
    const ogPath = Path.join(window.__base, 'static', 'taggedULB');
    let params = {
        'originalLanguagePath': ogPath
    }
    const UDBPath = Path.join(window.__base, 'static', 'taggedUDB');
    params.targetLanguagePath = path;
    params.gatewayLanguageUDBPath = UDBPath;
    try {
        if (manifest.ts_project) {
            params.bookAbbr = manifest.ts_project.id;
        }
        else if (manifest.project) {
            params.bookAbbr = manifest.project.id;
        }
        else {
            params.bookAbbr = manifest.project_id;
        }
        if (isArray(manifest.source_translations)) {
            params.gatewayLanguage = manifest.source_translations[0].language_id;
        } else {
            params.gatewayLanguage = manifest.source_translations.language_id;
        }
        params.direction = manifest.target_language ? manifest.target_language.direction : null;
        if (isOldTestament(params.bookAbbr)) {
            params.originalLanguage = "hebrew";
        } else {
            params.originalLanguage = "greek";
        }
    } catch (e) {
        console.error(e);
    }
    return params;
}

/**
 * @description Formated the target language accoring to tC standards
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 */
export function formatTargetLanguage(parsedUSFM) {
    let targetLanguage = {};
    targetLanguage.title = parsedUSFM.book;
    const chapters = parsedUSFM.chapters;
    for (let ch in chapters) {
        targetLanguage[chapters[ch].number] = {};
        const verses = chapters[ch].verses;
        for (let v in verses) {
            const verseText = verses[v].text.trim();
            targetLanguage[chapters[ch].number][verses[v].number] = verseText;
        }
    }
    if (parsedUSFM.headers) {
        const parsedHeaders = parsedUSFM.headers;
        if (parsedHeaders['mt1']) {
            targetLanguage.title = parsedHeaders['mt1'];
        } else if (parsedHeaders['id']) {
            targetLanguage.title = BOOKS[parsedHeaders['id'].toLowerCase()];
        }
    }
    return targetLanguage;
}

/**
 * @description Checks if the folder/file specified is a usfm project
 * 
 * @param {string} projectPath - Path in which the project is being loaded from 
 */
export function checkIfUSFMFileOrProject(projectPath) {
    try {
        fs.readFileSync(projectPath);
        const ext = projectPath.split(".")[1];
        if (ext == "usfm" || ext == "sfm") return projectPath;
    } catch (e) {
        try {
            let dir = fs.readdirSync(projectPath);
            for (let i in dir) {
                const ext = dir[i].split(".")[1];
                if (ext == "usfm" || ext == "sfm") return Path.join(projectPath, dir[i]);
            }
            return false;
        } catch (err) {
            return false;
        }
    }
}


/**
 * @description Verifies that the manifest given has an accurate count of finished chunks.
 * 
 * @param {string} projectPath - Path in which the project is being loaded from 
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function verifyChunks(projectPath, manifest) {
    const chunkChapters = fs.readdirSync(projectPath);
    let finishedChunks = [];
    for (const chapter in chunkChapters) {
        if (!isNaN(chunkChapters[chapter])) {
            const chunkVerses = fs.readdirSync(projectPath + '/' + chunkChapters[chapter]);
            for (let chunk in chunkVerses) {
                const currentChunk = chunkVerses[chunk].replace(/(?:\(.*\))?\.txt/g, '');
                const chunkString = chunkChapters[chapter].trim() + '-' + currentChunk.trim();
                if (!finishedChunks.includes(chunkString)) {
                    finishedChunks.push(chunkString);
                }
            }
        }
    }
    manifest.finished_chunks = finishedChunks;
    manifest.tcInitialized = true;
    return manifest;
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
 * 
 * @param {string} projectBook - book abbreviation of book to be converted
 */
export function isOldTestament(projectBook) {
    let passedBook = false;
    for (const book in BOOKS) {
        if (book == projectBook) passedBook = true;
        if (BOOKS[book] == "Malachi" && passedBook) {
            return true;
        }
    }
    return false;
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
            const checkArray = createCheckArray(dataObject, moduleFolderName);
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
                dispatch({ type: consts.SAVE_MODULE_VIEW, identifier: module.name, module: viewObj.view || viewObj.container });
            } catch (e) {
                console.log(e);
            }
        }
    });
}

/**
 * @description creates an array that has the data of each included tool and 'subtool'
 * 
 * @param {object} dataObject - Package json of the tool being loaded, 
 * meta data of what the tool needs to load.
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 */
export function createCheckArray(dataObject, moduleFolderName) {
    let modulePaths = [];
    try {
        if (!dataObject.name || !dataObject.version || !dataObject.title || !dataObject.main) {
            return;
        } else {
            modulePaths.push({ name: dataObject.name, location: moduleFolderName });
            for (let childFolderName in dataObject.include) {
                //If a developer hasn't defined their module in the corret way, this'll probably throw an error
                if (Array.isArray(dataObject.include)) {
                    modulePaths.push({
                        name: dataObject.include[childFolderName],
                        location: Path.join(PACKAGE_SUBMODULE_LOCATION, dataObject.include[childFolderName])
                    });
                } else {
                    modulePaths.push({
                        name: childFolderName,
                        location: Path.join(PACKAGE_SUBMODULE_LOCATION, childFolderName)
                    });
                }
            }
            return modulePaths;
        }
    } catch (e) {
        console.error(e)
    }
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
