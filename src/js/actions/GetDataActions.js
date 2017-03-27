/**
 * @file These are the actions that load a tC project from
 * the manifest.json to the tools being loaded into the store
 *
 * @exports GetData Actions
 * @version 0.0.1
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
import * as Helpers from '../utils/helpers';
import * as RecentProjectsActions from './RecentProjectsActions';

import pathex from 'path-extra';
import usfm from 'usfm-parser';
import { remote } from 'electron';
import BOOKS from '../components/core/BooksOfBible.js';
import Path from 'path';

let api = window.ModuleApi;
let GIT = require('../components/core/GitApi.js');
let PARENT = pathex.datadir('translationCore');
let PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');
let PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');
let DEFAULT_SAVE = Path.join(pathex.homedir(), 'translationCore');
let { dialog } = remote;
let extensionRegex = new RegExp('(\\.\\w+)', 'i');
let ORIGINAL_LANGUAGE_PATH = Path.join(window.__base, 'static/taggedULB');



/**
 * Sends project path to the store
 */
export function setProjectPath(pathLocation) {
    return {
        type: consts.SET_SAVE_PATH_LOCATION,
        pathLocation: pathLocation
    }
}

/**
 * Sends project manifest to the store
 */
export function setProjectManifest(manifest) {
    return {
        type: consts.STORE_MANIFEST,
        manifest: manifest
    }
}

/**
 * Sends project parameters to the store
 */
export function setProjectParams(params) {
    return {
        type: consts.STORE_PARAMS,
        params: params
    }
}




/**
 * Formats and saves manifest according to tC standards, 
 * if not already done so
 * 
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 * @param {object} manifest - Default manifest given in order to load a non-usfm project
 */
export function setUpManifest(projectPath, projectLink, manifest, currentUser) {
    let verifiedManifest = verifyChunks(projectPath, manifest);
    var newManifest = Helpers.saveManifest(projectPath, projectLink, verifiedManifest, currentUser);
    return newManifest;
}

/**
 * Returns the current user logged in from the current app state, 
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
 * Stores the project path loaded into the default tC folder 
 * location. If the project is exists in the default save location and it is
 * loaded from some place else, user will be prompted to overwrite it. Which results
 * in a deletion of the non-tC folder loaction project.
 * 
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function correctSaveLocation(projectPath) {
    var parsedPath = pathex.parse(projectPath);
    var tCProjectsSaveLocation = pathex.join(DEFAULT_SAVE, parsedPath.name);
    if (!fs.existsSync(projectPath)) {
        return false;
    }
    if (fs.existsSync(tCProjectsSaveLocation)) {
        if (projectPath != tCProjectsSaveLocation) {
            var continueCopy = confirm("This project is saved elsewhere on your computer. \nDo you want to overwrite it?");
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
 * Starter function to load a project from a folder path or link.
 * 
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openProject(projectPath, projectLink) {
    return ((dispatch, getState) => {
        var currentUser = getCurrentUser(getState());
        var usfmFilePath = checkIfUSFMFileOrProject(projectPath);
        if (usfmFilePath) {
            //USFM detected, initiating separate loading process
            dispatch(openUSFMProject(usfmFilePath, projectPath, 'ltr', projectLink, currentUser));
        }
        //No USFM detected, initiating 'standard' loading process
        if (projectPath) {
            projectPath = correctSaveLocation(projectPath);
            var manifest = Helpers.loadFile(projectPath, 'manifest.json');
            if (!manifest && !manifest.tcInitialized) {
                var manifest = setUpManifest(projectPath, projectLink, manifest, currentUser);
            } else if (!manifest) {
                var oldManifest = Helpers.loadFile(projectPath, 'tc-manifest.json');
                if (oldManifest) {
                    var manifest = setUpManifest(projectPath, oldManifest);
                }
            } else {
                dispatch(manifestError("No Path Specified."));
            }
            dispatch(addLoadedProjectToStore(projectPath, manifest));
            dispatch(displayToolsToLoad(manifest));
        }
    });
}

/**
 * 
 * @param {string} usfmFilePath - Path of the usfm file that has been loaded
 * @param {string} projectSaveLocation - Folder path containing the usfm file loaded
 */
export function setUpUSFMProject(usfmFilePath, projectSaveLocation) {
    var parsedPath = pathex.parse(usfmFilePath);
    var saveFile = Path.join(projectSaveLocation, parsedPath.base);
    var usfmData = fs.readFileSync(usfmFilePath).toString();
    fs.ensureDirSync(projectSaveLocation);
    fs.writeFileSync(saveFile, usfmData);
    return usfmData
}

/**
 * 
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {objet} user - The current user loaded
 */
export function setUpDefaultUSFMManifest(parsedUSFM, direction, user) {
    var name = user.username;
    var defaultManifest = {
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
            name: Helpers.convertToFullBookName(parsedUSFM.book)
        }
    }
}

/**
 * 
 * @param {*} projectPath - Path in which the USFM project is being loaded from 
 * @param {*} direction - Direction of the book being read for the project target language
 * @param {*} projectLink - Link given to load project if taken from online
 */
export function openUSFMProject(usfmFilePath, projectPath, direction, projectLink, currentUser) {
    return ((dispatch) => {
        var projectSaveLocation = correctSaveLocation(projectPath);
        dispatch(setProjectPath(projectSaveLocation));
        var usfmData = setUpUSFMProject(usfmFilePath, projectSaveLocation);
        var parsedUSFM = getParsedUSFM(usfmData);
        var targetLanguage = formatTargetLanguage(parsedUSFM);
        dispatch(ResourcesActions.addNewBible('targetLanguage', targetLanguage));
        setUSFMParams(parsedUSFM.book, projectSaveLocation, direction);
        var manifest = Helpers.loadFile(projectSaveLocation, 'manifest.json');
        if (!manifest) {
            var defaultManifest = setUpDefaultUSFMManifest(parsedUSFM, direction, currentUser);
            manifest = Helpers.saveManifest(projectSaveLocation, projectLink, defaultManifest);
        }
        addLoadedProjectToStore(projectSaveLocation, manifest);
        dispatch(displayToolsToLoad(manifest));
    });
}

/**
 * 
 * @param {*} projectPath - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmData) {
    try {
        var parsedUSFM = usfm.toJSON(usfmData);
        parsedUSFM.book = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
    } catch (e) {
        console.error(e);
    }
    return parsedUSFM;
}

/**
 * Starts loading a project that has a standard manifest created.
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
            const book = Helpers.convertToFullBookName(params.bookAbbr);
            dispatch(CheckStoreActions.setBookName(book));
            var targetLanguage = checkIfUSFMProject(projectPath);
            if (targetLanguage) {
                dispatch(ResourcesActions.addNewBible('targetLanguage', targetLanguage));
            }
        }
        dispatch(loadProjectDataFromFileSystem(projectPath));
    });
}

/**
 * Displays the currently loaded tools in the app, if 
 * project is a titus or ephisians, or if the userdata
 * is in developer mode.
 * 
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function displayToolsToLoad(manifest) {
    return ((dispatch, getState) => {
        var currentState = getState();
        if (Helpers.checkIfValidBetaProject(manifest) || (currentState.settingsReducer.currentSettings && currentState.settingsReducer.currentSettings.developerMode)) {
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
 * @param {string} projectPath - Path in which the project is being loaded from 
 */
export function loadProjectDataFromFileSystem(projectPath) {
    return ((dispatch) => {
        //TODO retrieve previous project data to put in store
    });
}


/**
 * Check if project is ephesians or titus, or if user is in developer mode.
 * 
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function checkIfValidBetaProject(manifest) {
    if (manifest && manifest.project) return manifest.project.id == "eph" || manifest.project.id == "tit";
    else if (manifest && manifest.ts_project) return manifest.ts_project.id == "eph" || manifest.ts_project.id == "tit";
}

/**
 * This methods will set the store state back to the inital state
 * 
 */
export function clearPreviousData() {
    return {
        type: consts.CLEAR_PREVIOUS_DATA
    }
}

/**
 * 
 * @param {string} path - Path in which the project is being loaded from, also should contain
 * the target language
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function getParams(path, manifest) {
    const isArray = (a) => {
        return (!!a) && (a.constructor === Array);
    }
    if (!manifest) return;
    if (manifest.package_version == '3') {
        manifest = fixManifestVerThree(manifest);
    }
    if (manifest.finished_chunks && manifest.finished_chunks.length == 0) {
        dispatch(manifestError("Project has no finished content in manifest"));
        return;
    }
    var ogPath = Path.join(window.__base, 'static', 'taggedULB');
    var params = {
        'originalLanguagePath': ogPath
    }
    var UDBPath = Path.join(window.__base, 'static', 'taggedUDB');
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
 * 
 * @param {*} parsedUSFM 
 */
export function formatTargetLanguage(parsedUSFM) {
    var targetLanguage = {};
    targetLanguage.title = parsedUSFM.book;
    var chapters = parsedUSFM.chapters;
    for (var ch in chapters) {
        targetLanguage[chapters[ch].number] = {};
        var verses = chapters[ch].verses;
        for (var v in verses) {
            var verseText = verses[v].text.trim();
            targetLanguage[chapters[ch].number][verses[v].number] = verseText;
        }
    }
    if (parsedUSFM.headers) {
        var parsedHeaders = parsedUSFM.headers;
        if (parsedHeaders['mt1']) {
            targetLanguage.title = parsedHeaders['mt1'];
        } else if (parsedHeaders['id']) {
            targetLanguage.title = BOOKS[parsedHeaders['id'].toLowerCase()];
        }
    }
    return targetLanguage;
}

/**
 * 
 * @param {*} projectPath 
 */
export function checkIfUSFMFileOrProject(projectPath) {
    try {
        var usfmFile = fs.readFileSync(projectPath);
        const ext = projectPath.split(".")[1];
        if (ext == "usfm" || ext == "sfm") return projectPath;
    } catch (e) {
        try {
            var dir = fs.readdirSync(projectPath);
            for (var i in dir) {
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
 * 
 * @param {*} projectPath 
 */
export function checkIfUSFMProject(projectPath) {
    var projectFolder = fs.readdirSync(projectPath);
    var targetLanguage;
    for (var file in projectFolder) {
        var parsedPath = Path.parse(projectFolder[file]);
        if (parsedPath.ext.toUpperCase() == ".SFM" || parsedPath.ext.toUpperCase() == '.USFM') {
            var actualFile = Path.join(projectPath, parsedPath.base);
            var tCProjectsSaveLocation = Path.join(DEFAULT_SAVE, parsedPath.name);
            var saveFile = Path.join(tCProjectsSaveLocation, parsedPath.base);
            try {
                try {
                    var data = fs.readFileSync(saveFile);
                } catch (err) {
                    var data = fs.readFileSync(actualFile);
                }
                if (!data) {
                    var tCProjectsSaveLocation = Path.join(projectPath, parsedPath.base);
                    var saveFile = tCProjectsSaveLocation;
                    data = fs.readFileSync(saveFile);
                    //saving it in the same directory the project was loaded from
                }

                var usfmData = data.toString();
                var parsedUSFM = usfm.toJSON(usfmData);
                if (parsedUSFM.headers['id']) parsedUSFM.book = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
            } catch (e) {
                console.error(e);
            }
            targetLanguage = formatTargetLanguage(parsedUSFM);
        }
    }
    return targetLanguage;
}


/**
 * 
 * @param {*} path 
 * @param {*} manifest 
 */
export function verifyChunks(path, manifest) {
    let chunkChapters = fs.readdirSync(path);
    let finishedChunks = [];
    for (let chapter in chunkChapters) {
        if (!isNaN(chunkChapters[chapter])) {
            let chunkVerses = fs.readdirSync(path + '/' + chunkChapters[chapter]);
            for (let chunk in chunkVerses) {
                let currentChunk = chunkVerses[chunk].replace(/(?:\(.*\))?\.txt/g, '');
                let chunkString = chunkChapters[chapter].trim() + '-' + currentChunk.trim();
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
 * @param {*} content 
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
 * @param {*} projectBook 
 */
export function isOldTestament(projectBook) {
    var passedBook = false;
    for (var book in BOOKS) {
        if (book == projectBook) passedBook = true;
        if (BOOKS[book] == "Malachi" && passedBook) {
            return true;
        }
    }
    return false;
}


/**
 * 
 * @param {*} moduleFolderName 
 */
export function loadModuleAndDependencies(moduleFolderName) {
    return ((dispatch) => {
        try {
            dispatch({ type: consts.START_LOADING });
            var modulePath = Path.join(moduleFolderName, 'package.json');
            var dataObject = fs.readJsonSync(modulePath);
            var checkArray = createCheckArray(dataObject, moduleFolderName);
            dispatch(saveModules(checkArray));
            dispatch(CheckStoreActions.setCheckNameSpace(dataObject.name))
            dispatch(CoreActionsRedux.changeModuleView('main'));
        } catch (e) {
            dispatch(errorLoadingProject(e));
        }

    });
}

/**
 * 
 * @param {*} checkArray 
 */
export function saveModules(checkArray) {
    return ((dispatch) => {
        for (let module of checkArray) {
            try {
                var viewObj = require(Path.join(module.location, 'Container'));
                dispatch({ type: consts.SAVE_MODULE_VIEW, identifier: module.name, module: viewObj.view || viewObj.container });
            } catch (e) {
                console.log(e);
            }
        }
    });
}

/**
 * 
 * @param {*} dataObject 
 * @param {*} moduleFolderName 
 */
export function createCheckArray(dataObject, moduleFolderName) {
    var modulePaths = [];
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
 * @param {*} err 
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
 * 
 * @param {*} bookAbbr 
 * @param {*} projectSaveLocation 
 * @param {*} direction 
 * @param {*} language 
 */
export function setUSFMParams(bookAbbr, projectSaveLocation, direction) {
    return ((dispatch) => {
        var params = {
            originalLanguagePath: ORIGINAL_LANGUAGE_PATH,
            targetLanguagePath: projectSaveLocation,
            direction: direction,
            bookAbbr: bookAbbr
        };
        if (Helpers.isOldTestament(bookAbbr)) {
            params.originalLanguage = "hebrew";
        } else {
            params.originalLanguage = "greek";
        }
        dispatch(setProjectParams(params));
    });
}
