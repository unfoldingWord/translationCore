import React from 'react';
import path from 'path-extra';
import env from 'tc-electron-env';
import fs from 'fs-extra';
import zipFolder from 'zip-folder';
import { apiHelpers, resourcesHelpers } from 'tc-source-content-updater';
import { delay } from '../../common/utils';
import consts from '../ActionTypes';
// helpers
import * as myProjectsHelpers from '../../helpers/myProjectsHelpers';
import { getProjectSaveLocation, getTranslate } from '../../selectors';
import { confirmAction } from '../../middleware/confirmation/confirmationMiddleware';
import {
  openAlertDialog,
  openOptionDialog,
  closeAlertDialog,
} from '../AlertModalActions';
import {
  DCS_BASE_URL,
  TC_PATH,
  TRANSLATION_NOTES,
  TRANSLATION_WORDS,
  WORD_ALIGNMENT,
} from '../../common/constants';
import { loadSettings } from '../../localStorage/loadMethods';
import * as manifestHelpers from '../../helpers/manifestHelpers';
import { getAlignedUsfm } from '../WordAlignmentActions';
import * as WordAlignmentHelpers from '../../helpers/WordAlignmentHelpers';
import * as bibleHelpers from '../../helpers/bibleHelpers';
import * as LoadHelpers from '../../helpers/LoadHelpers';
import * as gatewayLanguageHelpers from '../../helpers/gatewayLanguageHelpers';
import * as ProjectLoadingActions from './ProjectLoadingActions';

/**
 * With the list of project directories, generates an array of project detail objects
 * @returns {array} List of projects
 */
export function getMyProjects() {
  return ((dispatch, getState) => {
    myProjectsHelpers.migrateResourcesFolder();
    const state = getState();
    const { projectDetailsReducer: { projectSaveLocation } } = state;
    let projects = myProjectsHelpers.getProjectsFromFS(projectSaveLocation, null);

    dispatch({
      type: consts.GET_MY_PROJECTS,
      projects: projects,
    });
  });
}

/**
 * Moves a project into the archive after the user confirms.
 * Archived projects can be restored at a later time.
 * @param projectPath {string} the path to the project that will be archived.
 */
export const archiveProject = (projectPath) => (dispatch, getState) => {
  const translate = getTranslate(getState());

  // Display confirmation
  dispatch(confirmAction({
    message: translate('projects.confirm_archive'),
    confirmButtonText: translate('projects.archive_project'),
  }, executeArchive(projectPath)));
};

/**
 * Immediately archives a project and removes it from the project list.
 */
const executeArchive = (projectPath) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const archiveDir = path.join(env.home(), TC_PATH, '.archive');

  // Close project
  const openedProjectPath = getProjectSaveLocation(getState());

  if (projectPath === openedProjectPath) {
    dispatch(ProjectLoadingActions.closeProject());
  }

  // Archive project
  try {
    // TRICKY: macOS does not support `:` in file names, so convert them and the macOS `/` to `-`.
    const timestamp = (new Date()).toISOString().replace(/[:/]/g, '_');
    await fs.ensureDir(archiveDir);
    await fs.copy(projectPath, path.join(archiveDir, `${path.basename(projectPath)} (${timestamp})`));
    await fs.remove(projectPath);
  } catch (e) {
    console.error(`Could not archive ${projectPath}`, e);
    dispatch(openAlertDialog(translate('projects.archive_failed')));
    return;
  }

  // Update reducers
  dispatch({
    type: consts.ARCHIVE_PROJECT,
    path: projectPath,
  });

  // Success alert
  dispatch(openAlertDialog(translate('projects.archive_complete')));
};

/**
 * Loads a project by name and opens tools configuration.
 * This is a thunk action creator that returns an async function accepting dispatch.
 * It attempts to open the specified project and logs the result.
 *
 * @param {string} projectName - The name of the project to open
 * @returns {Function} A thunk function that accepts dispatch and returns a Promise<boolean>
 * @example
 * dispatch(loadProjectAndOpenTools('my-project'))
 *   .then(success => console.log('Project opened:', success));
 */
const loadProjectAndOpenTools = (projectName) => async (dispatch) => {
  try {
    await dispatch(ProjectLoadingActions.openProject(projectName));
    console.log(`loadProjectAndOpenTools() - Project '${projectName}' opened successfully`);
    return true;
  } catch (e) {
    console.error(`loadProjectAndOpenTools() - Could not open project '${projectName}'`, e);
  }
  return false;
};

/**
 * Displays a dialog for selecting a missing resource language.
 * This function wraps the promise-based dialog implementation and returns the selected language.
 *
 * @param {Function} dispatch - Redux dispatch function for triggering actions
 * @param {Function} translate - Translation function for localizing UI text
 * @param {string} projectName - Name of the project requiring resource selection
 * @param {Object} manifest - Project manifest containing resource configuration
 * @param {Array<Object>} languages - Array of available language objects with language code and display information
 * @param {string} toolName - Translation key for the tool name to display in the dialog
 * @returns {Promise<Object|null>} Promise that resolves to the selected language object or null if cancelled
 */
function showMissingResourceSelectionDialog(dispatch, translate, projectName, manifest, languages, toolName) {
  return showMissingResourceSelectionDialogPromise(dispatch, translate, projectName, languages, toolName)
    .then((selectedLanguage) => selectedLanguage);
}

/**
 * Creates and displays a modal dialog for selecting a missing resource language from a list.
 * The dialog presents a dropdown menu with available languages and allows the user to confirm
 * or cancel the selection. The promise resolves when the user makes a choice.
 *
 * @param {Function} dispatch - Redux dispatch function for triggering actions
 * @param {Function} translate - Translation function for localizing UI text
 * @param {string} projectName - Name of the project requiring resource selection
 * @param {Array<Object>} languages - Array of available language objects
 * @param {string} languages[].lc - Language code identifier
 * @param {string} languages[].owner - Owner of the language resource
 * @param {string} languages[].namePrompt - Display name for the language option
 * @param {string} toolName - Translation key for the tool name to display in the dialog
 * @returns {Promise<Object|null>} Promise that resolves to the selected language object when user clicks Select,
 *                                  or null when user clicks Cancel
 */
function showMissingResourceSelectionDialogPromise(dispatch, translate, projectName, languages, toolName) {
  return new Promise((resolve) => {
    let selectedLanguage = languages[0];
    const selectText = translate('buttons.select_button');
    const cancelText = translate('buttons.cancel_button');
    const toolNameStr = translate(toolName);
    const message = translate('projects.select_gateway_language', { tool_name: toolNameStr });

    const setSelectedLanguage = (selectedValue) => {
      selectedLanguage = languages.find(lang => `${lang.lc}_${lang.owner}` === selectedValue) || selectedLanguage;
    };

    const callback = (buttonPressed) => {
      dispatch(closeAlertDialog());
      delay(500);

      if (buttonPressed === selectText && selectedLanguage) {
        resolve(selectedLanguage);
        return;
      }

      resolve(null);
    };

    delay(1000);
    dispatch(openOptionDialog(
      <div>
        <div>{message}</div>
        <div style={{
          width: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '16px',
        }}>
          <select
            defaultValue={selectedLanguage.lc}
            onChange={e => setSelectedLanguage(e.target.value)}
            style={{
              width: '70%',
              padding: '8px',
              fontSize: '16px',
            }}
          >
            {languages.map(lang => {
              let key = `${lang.lc}_${lang.owner}`;
              return (
                <option key={key} value={key}>
                  {lang.owner + ' - ' + lang.namePrompt}
                </option>
              );
            })}
          </select>
        </div>
      </div>,
      callback,
      selectText,
      cancelText,
    ));
  });
}

/**
 * Initiates the process of selecting missing resources for a project.
 * This is a thunk action creator that sequentially prompts the user to select gateway languages
 * for Translation Notes, Translation Words, and Word Alignment resources if they are missing.
 * Each dialog is displayed only if the corresponding language array is populated.
 *
 * @param {string} projectPath - File system path to the project directory
 * @param {Object} manifest - Project manifest containing resource configuration
 * @param {Array<Object>} tnLanguages - Array of available Translation Notes gateway languages
 * @param {Array<Object>} twLanguages - Array of available Translation Words gateway languages
 * @param {Array<Object>} waLanguages - Array of available Word Alignment gateway languages
 * @returns {Function} Thunk function that accepts dispatch and getState, returns Promise<void>
 */
const selectMissingResources = (projectPath, manifest, tNoteResourcesFound, tnLanguages, tWordsRessourcesFound, twLanguages, wordAlignmentRessourcesFound, waLanguages) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const projectName = path.basename(projectPath);
  let tNotesSelectedLanguage, tWordsSelectedLanguage, wordAlignmentSelectedLanguage;

  if (!tNoteResourcesFound) {
    tNotesSelectedLanguage = await showMissingResourceSelectionDialog(dispatch, translate, projectName, manifest, tnLanguages, 'tools.translation_notes');

    if (tNotesSelectedLanguage) {
      console.log('tNotes Selected language', tNotesSelectedLanguage);
    }
  }

  if (!tWordsRessourcesFound) {
    tWordsSelectedLanguage = await showMissingResourceSelectionDialog(dispatch, translate, projectName, manifest, twLanguages, 'tools.translation_words');

    if (tWordsSelectedLanguage) {
      console.log('tWordsSelectedLanguage', tWordsSelectedLanguage);
    }
  }

  if (!wordAlignmentRessourcesFound) {
    wordAlignmentSelectedLanguage = await showMissingResourceSelectionDialog(dispatch, translate, projectName, manifest, waLanguages, 'tools.word_alignment');

    if (wordAlignmentSelectedLanguage) {
      console.log('wordAlignementSelectedLanguage', wordAlignmentSelectedLanguage);
    }
  }
};

/**
 * Generates a localized, comma-separated list of missing tool names.
 * @param {Function} translate - Translation function
 * @param {boolean} tNotesMissing - Whether Translation Notes are missing
 * @param {boolean} tWordsMissing - Whether Translation Words are missing
 * @param {boolean} wordAlignmentMissing - Whether Word Alignment is missing
 * @returns {string} Comma-separated list of missing tool names
 */
function getToolStrings(translate, tNotesMissing, tWordsMissing, wordAlignmentMissing) {
  const toolList = [];

  if (tNotesMissing) {
    toolList.push(translate('tools.translation_notes'));
  }

  if (tWordsMissing) {
    toolList.push(translate('tools.translation_words'));
  }

  if (wordAlignmentMissing) {
    toolList.push(translate('tools.word_alignment'));
  }

  return toolList.join(', ');
}

/**
 * Export the project after the user confirms.
 * Archived projects can be restored at a later time.
 * @param projectPath {string} the path to the project that will be archived.
 */
export const exportProject = (projectPath) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const projectName = path.basename(projectPath);

  console.log('exportProject() - projectPath:', projectPath);
  const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  console.log('exportProject() - manifest:', manifest);

  const exportResourceInfo = getExportResourceInfo(manifest);
  console.log('exportProject() - exportResourceInfo:', exportResourceInfo);
  const {
    tWordsRessourcesFound,
    tNoteResourcesFound,
    wordAlignmentRessourcesFound,
  } = exportResourceInfo;

  if (!tWordsRessourcesFound || !tNoteResourcesFound
    || !wordAlignmentRessourcesFound
  ){
    if (!tWordsRessourcesFound) {
      console.log('exportProject() - tWords Resources Not Found:');
    }

    if (!tNoteResourcesFound) {
      console.log('exportProject() - tNotes Resources Not Found:');
    }

    if (!wordAlignmentRessourcesFound) {
      console.log('exportProject() - wordAlignment Resources Not Found:');
    }

    const bookId = manifest.project?.id;
    // eslint-disable-next-line no-unused-vars
    const tnLanguages = gatewayLanguageHelpers.getGatewayLanguageList(bookId, TRANSLATION_NOTES);
    console.log('exportProject() - tnLanguages:', tnLanguages);
    await delay(100);
    // eslint-disable-next-line no-unused-vars
    const twLanguages = gatewayLanguageHelpers.getGatewayLanguageList(bookId, TRANSLATION_WORDS);
    console.log('exportProject() - twLanguages:', twLanguages);
    await delay(100);
    // eslint-disable-next-line no-unused-vars
    const waLanguages = gatewayLanguageHelpers.getGatewayLanguageList(bookId, WORD_ALIGNMENT);
    console.log('exportProject() - waLanguages:', waLanguages);
    await delay(100);

    const haveAllGLs = (tnLanguages?.length && twLanguages?.length && waLanguages?.length);

    if (!haveAllGLs) {
      console.log('exportProject() - Not all gateway languages found for project:', projectPath);
      const toolsMissingStr = getToolStrings(translate, !tnLanguages?.length, !twLanguages?.length, !waLanguages?.length);
      const messageStr = translate('projects.export_resources_incomplete',
        { tools: toolsMissingStr, project_name: projectName });

      dispatch(confirmAction({
        message: messageStr,
        confirmButtonText: translate('buttons.open_tools_button'),
      }, loadProjectAndOpenTools(projectName)));

      return;
    }

    const loadedProject = getProjectSaveLocation(getState());
    let openProjectFlag = false;

    if (loadedProject === projectPath) {
      console.log(`exportProject() - currentProject is same as projectPath '${projectPath}'`);
      openProjectFlag = true;
    } else {
      console.log(`exportProject() - currentProject '${loadedProject}' is different from projectPath '${projectPath}'`);
      openProjectFlag = true;
    }

    if (openProjectFlag) {
      const toolsMissingStr = getToolStrings(translate, !tNoteResourcesFound, !tWordsRessourcesFound, !wordAlignmentRessourcesFound);
      const messageStr = translate('projects.export_gl_not_selected',
        { tools: toolsMissingStr, project_name: projectName });

      dispatch(confirmAction({
        message: messageStr,
        confirmButtonText: translate('buttons.select_resources'),
      }, selectMissingResources(projectPath, manifest, tNoteResourcesFound, tnLanguages, tWordsRessourcesFound, twLanguages, wordAlignmentRessourcesFound, waLanguages)));
    }
    return;
  }


  // Display confirmation
  dispatch(confirmAction({
    message: translate('projects.confirm_export'),
    confirmButtonText: translate('projects.export_project'),
  }, executeExport(projectPath)));
};

/**
 * Gets export resource information and availability flags from the project manifest.
 *
 * @param {Object} manifest - Project manifest
 * @returns {Object} Resource information and resource availability flags
 */
function getExportResourceInfo(manifest) {
  const {
    originalResource,
    toolsSelectedOwners,
    toolsSelectedGLs,
  } = getToolsInfo(manifest);

  let tWordsRessourcesFound = false;
  let tNoteResourcesFound = false;
  let wordAlignmentRessourcesFound = false;

  /////////////////////////////
  // translationNotes resources

  const {
    gatewayLangOwner: tNotesGatewayLangOwner,
    gatewayLang: tNotesGatewayLang,
    originalLangOwner,
    tNotesTag,
    tNotesUrl,
    tAcademyTag,
    tAcademyUrl,
  } = getTranslationNotesResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest);

  const {
    tNotesOriginalLangTag,
    tNotesOriginalLangUrl,
  } = getTranslationNotesOriginalLanguageInfo(manifest, originalLangOwner, originalResource);

  if (
    tNotesUrl
    && tAcademyUrl
    && tNotesOriginalLangUrl
    && tNotesGatewayLangOwner
    && tNotesGatewayLang
  ) {
    tNoteResourcesFound = true;
  }

  /////////////////////////////
  // translationWords resources

  const {
    gatewayLangOwner: tWordsGatewayLangOwner,
    gatewayLang: tWordsGatewayLang,
    tWordsTag,
    tWordsUrl,
  } = getTranslationWordsResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest);

  const {
    tWordsOriginalLangTag,
    tWordsOriginalLangUrl,
  } = getTranslationWordsOriginalLanguageInfo(manifest, originalLangOwner, originalResource);

  if (
    tWordsUrl
    && tWordsOriginalLangUrl
    && tWordsGatewayLangOwner
    && tWordsGatewayLang
  ) {
    tWordsRessourcesFound = true;
  }

  /////////////////////////////
  // wordAlignment resources

  const {
    wordALignmentOriginalLangTag,
    wordALignmentOriginalLangUrl,
  } = getWordAlignmentOriginalLanguageInfo(toolsSelectedOwners, manifest, originalResource);

  if (wordALignmentOriginalLangUrl) {
    wordAlignmentRessourcesFound = true;
  }

  return {
    originalResource,
    toolsSelectedOwners,
    toolsSelectedGLs,
    tWordsRessourcesFound,
    tNoteResourcesFound,
    wordAlignmentRessourcesFound,
    originalLangOwner,
    tNotesTag,
    tNotesUrl,
    tAcademyTag,
    tAcademyUrl,
    tNotesOriginalLangTag,
    tNotesOriginalLangUrl,
    tWordsTag,
    tWordsUrl,
    tWordsOriginalLangTag,
    tWordsOriginalLangUrl,
    wordALignmentOriginalLangTag,
    wordALignmentOriginalLangUrl,
  };
}

/**
 * @description - Zip a folder to zipPath
 * @param {string} folderToZip - path of the project
 * @param {string} zipPath - Path to save the zip file
 */
export const zipFolderToFile = (folderToZip, zipPath) => new Promise((resolve, reject) => {
  zipFolder(folderToZip, zipPath, (err) => {
    if (err) {
      console.error('zipFolderToFile() - Could not create zip file.', err);
      reject('zipFolderToFile() - Could not create zip file.');
    } else {
      resolve(true);
    }
  });
});

/**
 * Generates a DCS (Door43 Content Service) URL for downloading a resource archive.
 * @param {string} owner - The owner/organization of the resource repository
 * @param {string} languageId - The language identifier (e.g., 'en', 'es')
 * @param {string} resourceId - The resource identifier (e.g., 'tn', 'tw', 'ulb')
 * @param {string} [version='master'] - The version/branch to download (defaults to 'master')
 * @returns {string} The complete download URL for the resource archive
 */
export function getDcsUrl(owner, languageId, resourceId, version = 'master') {
  const resourceName = `${languageId}_${resourceId}`;
  const version_ = (version !== 'master') ? apiHelpers.formatVersionWithV(version) : version;
  const baseUrl = DCS_BASE_URL;
  const downloadUrl = `${baseUrl}/${owner}/${resourceName}/archive/${version_}.zip`;
  return downloadUrl;
}

/**
 * Safely generates a DCS URL with error handling.
 * This function wraps getDcsUrl() and provides null-safe validation before attempting
 * to generate the URL. If any required parameter is missing, it returns null instead of throwing.
 *
 * @param {string} tag - The resource tag/key used for error logging purposes (not used in URL generation)
 * @param {string} owner - The owner/organization of the resource repository
 * @param {string} languageId - The language identifier (e.g., 'en', 'es')
 * @param {string} resourceId - The resource identifier (e.g., 'tn', 'tw', 'ulb')
 * @param {string} version - The version/branch of the resource
 * @returns {string|null} The complete download URL for the resource archive, or null if generation fails
 */
export function getDcsUrlRugged(tag, owner, languageId, resourceId, version) {
  if (owner && languageId && resourceId) {
    try {
      const url = getDcsUrl(owner, languageId, resourceId, version);
      return url;
    } catch (e) {
      console.error(`getDcsUrlRugged() - resource error - Could not generate DCS Url`, e,
        {
          owner,
          languageId,
          resourceId,
          version,
        });
    }
  }
  return null;
}

/**
 * Adds a DCS (Door43 Content Service) URL to the resources object using the specified tag as the key.
 * This function safely assigns the URL to the resources object with error handling to prevent
 * failures from propagating.
 *
 * @param {Object} resources - The resources object that will store the URL mapping
 * @param {string} tag - The key/tag used to identify this resource in the resources object
 * @param {string} url - The DCS URL to be stored
 * @returns {void}
 */
export function addDcsUrl(resources, tag, url) {
  if (resources && tag && url) {
    try {
      resources[tag] = url;
    } catch (e) {
      console.error(`addDcsUrl() - resource error - Could not push DCS Url`, e,
        {
          tag,
          url,
        });
    }
  }
}

/**
 * Recursively removes leading dots from folder names to avoid issues with zip libraries
 * @param {string} basePath - The base path containing folders
 */
const removeDotPrefixFromFolders = (basePath) => {
  const items = fs.readdirSync(basePath);

  items.forEach(item => {
    const itemPath = path.join(basePath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      let currentPath = itemPath;

      // If directory starts with dot, rename it
      if (item.startsWith('.')) {
        const newName = item.substring(1); // Remove the leading dot
        const newPath = path.join(basePath, newName);
        fs.moveSync(itemPath, newPath);
        currentPath = newPath;
      }

      // Recursively process subdirectories
      removeDotPrefixFromFolders(currentPath);
    }
  });
};

/**
 * Extracts and organizes tool-related information from the project manifest.
 * Determines the original language resource based on the book ID and retrieves
 * the selected owners and gateway languages for various translation tools.
 *
 * @param {Object} manifest - The project manifest containing project metadata and tool settings
 * @param {Object} manifest.project - Project information
 * @param {string} manifest.project.id - The book ID used to determine original language
 * @param {Object} manifest.toolsSelectedOwners - Selected resource owners for each tool
 * @param {Object} manifest.toolsSelectedGLs - Selected gateway languages for each tool
 * @returns {Object} Object containing original resource info and tool selections
 * @returns {Object} return.originalResource - Original language resource with languageId and bibleId
 * @returns {Object} return.toolsSelectedOwners - Selected owners for translation tools
 * @returns {Object} return.toolsSelectedGLs - Selected gateway languages for translation tools
 */
function getToolsInfo(manifest) {
  const bookId = manifest.project?.id;
  const originalResource = bibleHelpers.getOrigLangforBook(bookId);
  const toolsSelectedOwners = manifest.toolsSelectedOwners;
  const toolsSelectedGLs = manifest.toolsSelectedGLs;
  return {
    originalResource,
    toolsSelectedOwners,
    toolsSelectedGLs,
  };
}

/**
 * Retrieves and constructs resource information for Translation Notes in the gateway language.
 * Determines the appropriate owner, language, and version for Translation Notes and Translation Academy
 * resources, and generates DCS URLs for downloading these resources.
 *
 * @param {Object} toolsSelectedOwners - Selected resource owners for each tool
 * @param {string} toolsSelectedOwners.translationNotes - Owner selected for Translation Notes
 * @param {Object} toolsSelectedGLs - Selected gateway languages for each tool
 * @param {string} toolsSelectedGLs.translationNotes - Gateway language selected for Translation Notes
 * @param {Object} manifest - Project manifest containing version information
 * @returns {Object} Object containing Translation Notes resource information
 * @returns {string} return.gatewayLangOwner - Owner for gateway language resources
 * @returns {string} return.originalLangOwner - Owner for original language resources
 * @returns {string} return.gatewayLang - Gateway language identifier
 * @returns {string} return.gatewayLangTag - Manifest key for gateway language version
 * @returns {string} return.gatewayLangKey - Full version key from manifest
 * @returns {Object} return.gatewayLangInfo - Parsed version and owner information
 * @returns {string} return.version - Resource version
 * @returns {string} return.owner - Final owner for the resource
 * @returns {string} return.tNotesTag - Tag for Translation Notes resource
 * @returns {string} return.tNotesUrl - Download URL for Translation Notes
 * @returns {string} return.tAcademyTag - Tag for Translation Academy resource
 * @returns {string} return.tAcademyUrl - Download URL for Translation Academy
 */
function getTranslationNotesResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest) {
  const gatewayLangOwner = toolsSelectedOwners?.translationNotes;
  const originalLangOwner = (gatewayLangOwner !== 'Door43-Catalog') ? 'unfoldingWord' : gatewayLangOwner;
  const gatewayLang = toolsSelectedGLs?.translationNotes;
  const gatewayLangTag = `tc_${gatewayLang}_check_version_translationNotes`;
  const gatewayLangKey = manifest[gatewayLangTag];
  const gatewayLangInfo = resourcesHelpers.splitVersionAndOwner(gatewayLangKey);
  const version = gatewayLangInfo.version;
  const owner = gatewayLangInfo.owner || gatewayLangOwner;
  const tNotesTag = 'tNotesGateway';
  const tNotesUrl = getDcsUrlRugged(tNotesTag, owner, gatewayLang, 'tn', version);
  const tAcademyTag = 'tAcademyGateway';
  const tAcademyUrl = getDcsUrlRugged(tAcademyTag, owner, gatewayLang, 'ta');

  return {
    gatewayLangOwner,
    originalLangOwner,
    gatewayLang,
    gatewayLangTag,
    gatewayLangKey,
    gatewayLangInfo,
    version,
    owner,
    tNotesTag,
    tNotesUrl,
    tAcademyTag,
    tAcademyUrl,
  };
}

/**
 * Retrieves and constructs resource information for Translation Notes in the original language.
 * Extracts version information from the manifest and generates the DCS URL for downloading
 * the original language Translation Notes resource.
 *
 * @param {Object} manifest - Project manifest containing version information
 * @param {string} manifest.tc_orig_lang_check_version_translationNotes - Version key for original language Translation Notes
 * @param {string} originalLangOwner - Owner for original language resources
 * @param {Object} originalResource - Original language resource information
 * @param {string} originalResource.languageId - Original language identifier (e.g., 'hbo', 'el-x-koine')
 * @param {string} originalResource.bibleId - Original language Bible identifier (e.g., 'uhb', 'ugnt')
 * @returns {Object} Object containing original language Translation Notes information
 * @returns {string} return.originalLangKey - Version key from manifest
 * @returns {Object} return.originalLangInfo - Parsed version and owner information
 * @returns {string} return.version - Resource version
 * @returns {string} return.owner - Final owner for the resource
 * @returns {string} return.tNotesOriginalLangTag - Tag for original language Translation Notes
 * @returns {string} return.tNotesOriginalLangUrl - Download URL for original language Translation Notes
 */
function getTranslationNotesOriginalLanguageInfo(manifest, originalLangOwner, originalResource) {
  const originalLangKey = manifest['tc_orig_lang_check_version_translationNotes'];
  const originalLangInfo = resourcesHelpers.splitVersionAndOwner(originalLangKey);
  const version = originalLangInfo.version;
  const owner = originalLangInfo.owner || originalLangOwner;
  const tNotesOriginalLangTag = 'tNotesOriginalLang';
  const tNotesOriginalLangUrl = getDcsUrlRugged(tNotesOriginalLangTag, owner, originalResource.languageId, originalResource.bibleId, version);

  return {
    originalLangKey,
    originalLangInfo,
    version,
    owner,
    tNotesOriginalLangTag,
    tNotesOriginalLangUrl,
  };
}

/**
 * Retrieves and constructs resource information for Translation Words in the gateway language.
 * Determines the appropriate owner, language, and version for Translation Words resources,
 * and generates the DCS URL for downloading these resources.
 *
 * @param {Object} toolsSelectedOwners - Selected resource owners for each tool
 * @param {string} toolsSelectedOwners.translationWords - Owner selected for Translation Words
 * @param {Object} toolsSelectedGLs - Selected gateway languages for each tool
 * @param {string} toolsSelectedGLs.translationWords - Gateway language selected for Translation Words
 * @param {Object} manifest - Project manifest containing version information
 * @returns {Object} Object containing Translation Words resource information
 * @returns {string} return.originalLangOwner - Owner for original language resources
 * @returns {string} return.gatewayLang - Gateway language identifier
 * @returns {string} return.version - Resource version
 * @returns {string} return.owner - Final owner for the resource
 * @returns {string} return.tWordsTag - Tag for Translation Words resource
 * @returns {string} return.tWordsUrl - Download URL for Translation Words
 */
function getTranslationWordsResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest) {
  const gatewayLangOwner = toolsSelectedOwners?.translationWords;
  const originalLangOwner = (gatewayLangOwner !== 'Door43-Catalog') ? 'unfoldingWord' : gatewayLangOwner;
  const gatewayLang = toolsSelectedGLs?.translationWords;
  const gatewayLangTag = `tc_${gatewayLang}_check_version_translationWords`;
  const gatewayLangKey = manifest[gatewayLangTag];
  const gatewayLangInfo = resourcesHelpers.splitVersionAndOwner(gatewayLangKey);
  const version = gatewayLangInfo.version;
  const owner = gatewayLangInfo.owner || gatewayLangOwner;
  const tWordsTag = 'tWordsGateway';
  const tWordsUrl = getDcsUrlRugged(tWordsTag, owner, gatewayLang, 'tw', version);

  return {
    originalLangOwner,
    gatewayLang,
    version,
    owner,
    tWordsTag,
    tWordsUrl,
  };
}

/**
 * Retrieves and constructs resource information for Translation Words in the original language.
 * Extracts version information from the manifest and generates the DCS URL for downloading
 * the original language Translation Words resource.
 *
 * @param {Object} manifest - Project manifest containing version information
 * @param {string} manifest.tc_orig_lang_check_version_translationWords - Version key for original language Translation Words
 * @param {string} originalLangOwner - Owner for original language resources
 * @param {Object} originalResource - Original language resource information
 * @param {string} originalResource.languageId - Original language identifier (e.g., 'hbo', 'el-x-koine')
 * @param {string} originalResource.bibleId - Original language Bible identifier (e.g., 'uhb', 'ugnt')
 * @returns {Object} Object containing original language Translation Words information
 * @returns {string} return.version - Resource version
 * @returns {string} return.owner - Final owner for the resource
 * @returns {string} return.tWordsOriginalLangTag - Tag for original language Translation Words
 * @returns {string} return.tWordsOriginalLangUrl - Download URL for original language Translation Words
 */
function getTranslationWordsOriginalLanguageInfo(manifest, originalLangOwner, originalResource) {
  const originalLangKey = manifest['tc_orig_lang_check_version_translationWords'];
  const originalLangInfo = resourcesHelpers.splitVersionAndOwner(originalLangKey);
  const version = originalLangInfo.version;
  const owner = originalLangInfo.owner || originalLangOwner;
  const tWordsOriginalLangTag = 'tWordsOriginalLang';
  const tWordsOriginalLangUrl = getDcsUrlRugged(tWordsOriginalLangTag, owner, originalResource.languageId, originalResource.bibleId, version);

  return {
    version,
    owner,
    tWordsOriginalLangTag,
    tWordsOriginalLangUrl,
  };
}

/**
 * Retrieves and constructs resource information for Word Alignment in the original language.
 * Determines the appropriate owner and extracts version information from the manifest,
 * then generates the DCS URL for downloading the original language Word Alignment resource.
 *
 * @param {Object} toolsSelectedOwners - Selected resource owners for each tool
 * @param {string} toolsSelectedOwners.wordAlignment - Owner selected for Word Alignment
 * @param {Object} manifest - Project manifest containing version information
 * @param {string} manifest.tc_orig_lang_check_version_wordAlignment - Version key for original language Word Alignment
 * @param {Object} originalResource - Original language resource information
 * @param {string} originalResource.languageId - Original language identifier (e.g., 'hbo', 'el-x-koine')
 * @param {string} originalResource.bibleId - Original language Bible identifier (e.g., 'uhb', 'ugnt')
 * @returns {Object} Object containing original language Word Alignment information
 * @returns {string} return.originalLangOwner - Owner for original language resources
 * @returns {string} return.version - Resource version
 * @returns {string} return.owner - Final owner for the resource
 * @returns {string} return.wordALignmentOriginalLangTag - Tag for original language Word Alignment
 * @returns {string} return.wordALignmentOriginalLangUrl - Download URL for original language Word Alignment
 */
function getWordAlignmentOriginalLanguageInfo(toolsSelectedOwners, manifest, originalResource) {
  const gatewayLangOwner = toolsSelectedOwners?.wordAlignment;
  const originalLangOwner = (gatewayLangOwner !== 'Door43-Catalog') ? 'unfoldingWord' : gatewayLangOwner;

  const originalLangKey = manifest['tc_orig_lang_check_version_wordAlignment'];
  const originalLangInfo = resourcesHelpers.splitVersionAndOwner(originalLangKey);
  const version = originalLangInfo.version;
  const owner = originalLangInfo.owner || originalLangOwner;
  const wordALignmentOriginalLangTag = 'waOriginalLang';
  const wordALignmentOriginalLangUrl = getDcsUrlRugged(wordALignmentOriginalLangTag, owner, originalResource.languageId, originalResource.bibleId, version);

  return {
    originalLangOwner,
    version,
    owner,
    wordALignmentOriginalLangTag,
    wordALignmentOriginalLangUrl,
  };
}

/**
 * Immediately archives a project and removes it from the project list.
 */
const executeExport = (projectPath) => async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const archiveDir = path.join(env.home(), TC_PATH, 'export');
  let destinationPath = '';
  const openedProjectPath = getProjectSaveLocation(getState());
  const resources = {};

  // Close project
  if (projectPath === openedProjectPath) {
    dispatch(ProjectLoadingActions.closeProject());
  }

  // Export project
  try {
    // TRICKY: macOS does not support `:` in file names, so convert them and the macOS `/` to `-`.
    const timestamp = (new Date()).toISOString().replace(/[:/]/g, '_');
    await fs.ensureDir(archiveDir);
    const projectName = path.basename(projectPath);
    const exportProjectName = `${projectName}-${timestamp}`;
    const exportProjectPath = path.join(archiveDir, exportProjectName);

    await fs.copy(projectPath, exportProjectPath, {
      filter: (file) => {
        const baseName = path.basename(file);

        if ((baseName !== '.git') && (baseName !== '.DS_Store')) {
          return true;
        }
        return false;
      }, // Include all files and folders, except for excluded folder names
      // eslint-disable-next-line object-curly-newline
    });

    const manifest = manifestHelpers.getProjectManifest(projectPath);

    // add settings to manifest
    const settings = loadSettings();
    manifest.settings = settings;

    // add resources to manifest
    manifest.externalResources = resources;
    const scriptures = [];
    const currentPaneSettings = settings?.toolsSettings?.ScripturePane?.currentPaneSettings || [];

    for (const currentPane of currentPaneSettings) {
      const owner = currentPane.owner;
      const languageId = currentPane.languageId;

      // skip non-repo resources
      if (languageId === 'targetLanguage' || languageId === 'originalLanguage') {
        continue;
      }

      const resourceId = `${languageId}_${currentPane.bibleId}`;
      const resource = `https://git.door43.org/${owner}/${resourceId}`;
      scriptures.push(resource);
    }

    if (manifest.view_url) {
      scriptures.push(manifest.view_url);
    }

    if (scriptures.length > 0) {
      resources.scriptures = scriptures;
    }

    const {
      tNotesTag,
      tNotesUrl,
      tAcademyTag,
      tAcademyUrl,
      tNotesOriginalLangTag,
      tNotesOriginalLangUrl,
      tWordsTag,
      tWordsUrl,
      tWordsOriginalLangTag,
      tWordsOriginalLangUrl,
      wordALignmentOriginalLangTag,
      wordALignmentOriginalLangUrl,
    } = getExportResourceInfo(manifest);
    addDcsUrl(resources, tNotesTag, tNotesUrl);
    addDcsUrl(resources, tAcademyTag, tAcademyUrl);
    addDcsUrl(resources, tNotesOriginalLangTag, tNotesOriginalLangUrl);
    addDcsUrl(resources, tWordsTag, tWordsUrl);
    addDcsUrl(resources, tWordsOriginalLangTag, tWordsOriginalLangUrl);
    addDcsUrl(resources, wordALignmentOriginalLangTag, wordALignmentOriginalLangUrl);

    // save updated alignment data
    const usfm = await getAlignedUsfm(projectPath, manifest);
    const waPath = path.join(exportProjectPath, 'wordAlignments');
    fs.ensureDirSync(waPath);
    const usfmFilePath = path.join(waPath, projectName + '.usfm');
    WordAlignmentHelpers.writeToFS(usfmFilePath, usfm);

    manifestHelpers.setUpManifest(exportProjectPath, manifest); // save updated manifest

    removeDotPrefixFromFolders(exportProjectPath);

    // zip exported project
    const zipFileName = path.join(archiveDir, exportProjectName + '.zip');
    await zipFolderToFile(exportProjectPath, zipFileName);
    destinationPath = zipFileName;
    await fs.remove(exportProjectPath);
  } catch (e) {
    console.error(`Could not archive ${projectPath}`, e);
    dispatch(openAlertDialog(translate('projects.exportfailed')));
    return;
  }

  // Success alert
  dispatch(openAlertDialog(translate('projects.export_complete', { path: destinationPath })));
};
