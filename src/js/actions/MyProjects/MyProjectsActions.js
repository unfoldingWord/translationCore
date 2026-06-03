import path from 'path-extra';
import env from 'tc-electron-env';
import fs from 'fs-extra';
import zipFolder from 'zip-folder';
import { apiHelpers, resourcesHelpers } from 'tc-source-content-updater';
import consts from '../ActionTypes';
// helpers
import * as myProjectsHelpers from '../../helpers/myProjectsHelpers';
import { getProjectSaveLocation, getTranslate } from '../../selectors';
import { confirmAction } from '../../middleware/confirmation/confirmationMiddleware';
import { openAlertDialog } from '../AlertModalActions';
import { DCS_BASE_URL, TC_PATH } from '../../common/constants';
import { loadSettings } from '../../localStorage/loadMethods';
import * as manifestHelpers from '../../helpers/manifestHelpers';
import { getAlignedUsfm } from '../WordAlignmentActions';
import * as WordAlignmentHelpers from '../../helpers/WordAlignmentHelpers';
import * as bibleHelpers from '../../helpers/bibleHelpers';
import * as LoadHelpers from '../../helpers/LoadHelpers';
import { closeProject } from './ProjectLoadingActions';

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
    dispatch(closeProject());
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
 * Export the project after the user confirms.
 * Archived projects can be restored at a later time.
 * @param projectPath {string} the path to the project that will be archived.
 */
export const exportProject = (projectPath) => (dispatch, getState) => {
  const translate = getTranslate(getState());

  // const openedProjectPath = getProjectSaveLocation(getState());
  console.log('exportProject() - projectPath:', projectPath);
  const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  console.log('exportProject() - manifest:', manifest);

  const {
    originalResource,
    toolsSelectedOwners,
    toolsSelectedGLs,
  } = getToolsInfo(manifest);

  let twRessourcesFound = false;
  let tnResourcesFound = false;

  /////////////////
  // verify have translationNotes resources
  const {
    originalLangOwner,
    tNotesUrl,
    tAcademyUrl,
  } = getTranslationNotesResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest);

  const {
    tNotesOriginalLangUrl,
  } = getTranslationNotesOriginalLanguageInfo(manifest, originalLangOwner, originalResource);

  if (tNotesUrl && tAcademyUrl && tNotesOriginalLangUrl) {
    tnResourcesFound = true;
  }

  /////////////////
  // verify have translationWords resources

  const {
    tWordsUrl,
  } = getTranslationWordsResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest);

  const {
    tWordsOriginalLangUrl,
  } = getTranslationWordsOriginalLanguageInfo(manifest, originalLangOwner, originalResource);

  if (tWordsUrl && tWordsOriginalLangUrl) {
    twRessourcesFound = true;
  }

  // Display confirmation
  dispatch(confirmAction({
    message: translate('projects.confirm_export'),
    confirmButtonText: translate('projects.export_project'),
  }, executeExport(projectPath)));
};

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
 * @param {Object} resources - The resources object (not used in current implementation)
 * @param {string} tag - The resource tag/key (not used in current implementation)
 * @param {string} owner - The owner/organization of the resource repository
 * @param {string} languageId - The language identifier (e.g., 'en', 'es')
 * @param {string} resourceId - The resource identifier (e.g., 'tn', 'tw', 'ulb')
 * @param {string} version - The version/branch of the resource
 * @returns {string|null} The complete download URL for the resource archive, or null if generation fails
 */
export function getDcsUrlRugged( tag, owner, languageId, resourceId, version) {
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
    dispatch(closeProject());
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
      };

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
      originalResource,
      toolsSelectedOwners,
      toolsSelectedGLs,
    } = getToolsInfo(manifest);


    /////////////////
    // translationNotes
    const {
      originalLangOwner,
      tNotesTag,
      tNotesUrl,
      tAcademyTag,
      tAcademyUrl,
    } = getTranslationNotesResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest);
    addDcsUrl(resources, tNotesTag, tNotesUrl);
    addDcsUrl(resources, tAcademyTag, tAcademyUrl);

    const {
      tNotesOriginalLangTag,
      tNotesOriginalLangUrl,
    } = getTranslationNotesOriginalLanguageInfo(manifest, originalLangOwner, originalResource);
    addDcsUrl(resources, tNotesOriginalLangTag, tNotesOriginalLangUrl);


    /////////////////
    // translationWords
    const {
      tWordsTag,
      tWordsUrl,
    } = getTranslationWordsResourceInfo(toolsSelectedOwners, toolsSelectedGLs, manifest);
    addDcsUrl(resources, tWordsTag, tWordsUrl);

    const {
      tWordsOriginalLangTag,
      tWordsOriginalLangUrl,
    } = getTranslationWordsOriginalLanguageInfo(manifest, originalLangOwner, originalResource);
    addDcsUrl(resources, tWordsOriginalLangTag, tWordsOriginalLangUrl);

    /////////////////
    // wordAlignment
    const {
      wordALignmentOriginalLangTag,
      wordALignmentOriginalLangUrl,
    } = getWordAlignmentOriginalLanguageInfo(toolsSelectedOwners, manifest, originalResource);
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
