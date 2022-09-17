/* eslint-disable no-await-in-loop */
import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import usfmjs from 'usfm-js';
import { TextField } from 'material-ui';
import { batchActions } from 'redux-batched-actions';
import {
  apiHelpers,
  downloadHelpers,
  resourcesHelpers,
} from 'tc-source-content-updater';
import * as YAML from 'yamljs';
import consts from '../ActionTypes';
// actions
import migrateProject from '../../helpers/ProjectMigration';
import { initializeReducersForProjectOpenValidation, validateProject } from '../Import/ProjectValidationActions';
import * as BodyUIActions from '../BodyUIActions';
import * as RecentProjectsActions from '../RecentProjectsActions';
import {
  openAlertDialog,
  openOptionDialog,
  closeAlertDialog,
} from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
import { openSoftwareUpdate } from '../SoftwareUpdateActions';
//helpers
import * as manifestHelpers from '../../helpers/manifestHelpers';
import ResourceAPI from '../../helpers/ResourceAPI';

import {
  getActiveLocaleLanguage,
  getProjectManifest,
  getProjects,
  getProjectSaveLocation,
  getSelectedToolApi,
  getSourceBook,
  getSupportingToolApis,
  getTargetBook,
  getToolGatewayLanguage,
  getToolGlOwner,
  getTools,
  getToolsSelectedGLs,
  getTranslate,
  getUsername,
} from '../../selectors';
import { isProjectSupported } from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import {
  addNewBible,
  loadSourceBookTranslations,
  loadTargetLanguageBook,
} from '../ResourcesActions';
import ProjectAPI from '../../helpers/ProjectAPI';
import CoreAPI from '../../helpers/CoreAPI';
import {
  copyGroupDataToProject,
  getOriginalLangOwner,
  setDefaultProjectCategories,
} from '../../helpers/ResourcesHelpers';
import * as BibleHelpers from '../../helpers/bibleHelpers';
import { delay } from '../../common/utils';
import * as Bible from '../../common/BooksOfTheBible';
// constants
import {
  APP_VERSION,
  DEFAULT_ORIG_LANG_OWNER,
  DEFAULT_OWNER,
  IMPORTS_PATH,
  MIN_COMPATIBLE_VERSION,
  PROJECTS_PATH,
  tc_EDIT_VERSION_KEY,
  tc_LAST_OPENED_KEY,
  tc_MIN_COMPATIBLE_VERSION_KEY,
  tc_MIN_UGNT_ERROR,
  tc_MIN_VERSION_ERROR,
  TRANSLATION_WORDS,
  USER_RESOURCES_PATH,
  VIEW_DATA_PATH,
} from '../../common/constants';
import { getUSFMDetails } from '../../helpers/usfmHelpers';
import { confirmOnlineAction } from '../OnlineModeConfirmActions';
import { getMostRecentVersionInFolder } from '../../helpers/originalLanguageResourcesHelpers';
import { downloadMissingResource } from '../SourceContentUpdatesActions';

export const promptForViewUrl = (projectSaveLocation, translate) => (dispatch, getState) => {
  dispatch(confirmOnlineAction(() => {
    const manifestPath = path.join(projectSaveLocation, 'manifest.json');
    const manifest = fs.readJsonSync(manifestPath);
    let projectName = path.basename(projectSaveLocation);
    let bookId = manifest?.project?.id;
    const viewUrl = manifest?.view_url;
    let newUrl = viewUrl || '';
    const importText = translate('buttons.import_button');
    const cancelText = translate('buttons.cancel_button');

    function setUrl(newValue) {
      newUrl = (newValue || '').trim();
    }

    function deleteViewUrl() {
      console.log('remove viewUrl');
      updateViewUrl(null);
    }

    function updateViewUrl(viewUrl_) {
      dispatch(closeProject()); // make sure closed before updating manifest
      const manifest = fs.readJsonSync(manifestPath);
      manifest.view_url = viewUrl_;
      fs.writeJsonSync(manifestPath, manifest);
      dispatch(openProject(projectName));
      dispatch(closeAlertDialog());
    }

    async function callback(buttonPressed) {
      if (newUrl && (buttonPressed === importText)) {
        dispatch(openAlertDialog(translate('projects.loading_usfm_url', { usfm_url: newUrl }), true));
        await delay(250);
        dispatch(downloadAndLoadViewUrlWithFallback(newUrl, bookId, projectName)).then(results => {
          let {
            usfm,
            error,
            viewUrl: viewUrl_,
          } = results;

          if (!usfm || error) {
            console.warn(`promptForViewUrl() - download response: ${JSON.stringify(results)}`);
            const error_message = error ? error.toString() : 'Invalid USFM';
            const message = translate('projects.load_view_usfm_url_error',
              {
                error_message,
                project_url: newUrl,
              });
            dispatch(closeAlertDialog());
            delay(250).then(() => dispatch(openAlertDialog(message)));
          } else {
            console.log(`promptForViewUrl() - usfm loaded: ${viewUrl_}`);
            updateViewUrl(viewUrl_);
          }
        });
      } else {
        dispatch(closeAlertDialog());
      }
    }

    dispatch(
      openOptionDialog(
        <div>
          {projectName}
          <div style={{
            width: '500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <TextField
              defaultValue={viewUrl}
              multiLine
              rowsMax={4}
              id="view-url-input"
              className="ViewUrl"
              floatingLabelText={translate('projects.enter_resource_url')}
              // underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
              floatingLabelStyle={{
                color: 'var(--text-color-dark)',
                opacity: '0.3',
                fontWeight: '500',
              }}
              onChange={e => setUrl(e.target.value)}
              autoFocus={true}
              style={{ width: '100%' }}
            />
            {viewUrl && <button className='btn-prime' onClick={deleteViewUrl} >
              {translate('buttons.delete')}
            </button>}
          </div>
        </div>, callback, importText, cancelText));
  }));
};

/**
 * load file from URL and save to destination
 * @param {string} url
 * @param {string} destination
 */
export const downloadFromUrl = (url, destination) => (dispatch) => new Promise(function (resolve) {
  if (url) {
    downloadHelpers.download(url, destination, null, 1).then(results => { // download to file
      if (results.status === 200) {
        resolve({});
      } else {
        resolve({ error: `returned invalid status ${results.status}` });
      }
    }).catch(error => {
      console.log(`downloadFromUrl() - download from ${url} failed)`, error);
      resolve({ error } );
    });
  } else {
    resolve({ error: `no URL` });
  }
});

/**
 * load USFM file from URL and add to reducer
 * @param {string} viewUrl
 * @param {string} bookId
 * @param {string} projectName
 */
export const downloadAndLoadViewUrlWithFallback = (viewUrl, bookId, projectName) => async (dispatch) => {
  if (viewUrl) {
    try {
      let foundUrl = viewUrl;
      let results = await dispatch(downloadAndLoadViewUrl(foundUrl, bookId, projectName));

      if (!results.usfm || results.error) {
        // get URL parts
        const urlParts = viewUrl.split('/');
        console.log(`urlParts`, urlParts);

        if (urlParts.length > 5) {
          if (urlParts[5].toLowerCase() === 'src') { // try switching to raw
            const urlParts_ = [...urlParts];
            urlParts_[5] = 'raw';
            foundUrl = urlParts_.join('/');
            results = await dispatch(downloadAndLoadViewUrl(foundUrl, bookId, projectName));
          }
        }

        if (!results.usfm || results.error) {
          if (urlParts.length > 4) {
            let [protocol, , host, owner, repo, , tagType, tag] = urlParts;
            let format = 'raw';

            if (!tag) {
              tagType = 'branch';
              tag = 'master';
            }

            let baseUrl = `${protocol}//${host}/${owner}/${repo}/${format}/${tagType}/${tag}/`;
            const testUrls = [baseUrl];
            tagType = 'branch'; tag = 'master';
            baseUrl = `${protocol}//${host}/${owner}/${repo}/${format}/${tagType}/${tag}/`;
            testUrls.push(baseUrl);
            tagType = 'branch'; tag = 'main';
            baseUrl = `${protocol}//${host}/${owner}/${repo}/${format}/${tagType}/${tag}/`;
            testUrls.push(baseUrl);
            const importspath = IMPORTS_PATH;
            const manifestPath = path.join(importspath, 'manifest.yaml');
            fs.ensureDirSync(importspath);

            for (baseUrl of testUrls) {
              const url = baseUrl + 'manifest.yaml';
              console.log(`downloadAndLoadViewUrlWithFallback() - trying ${url}`);
              results = await dispatch(downloadFromUrl(url, manifestPath));

              if (results.error) {
                console.warn(`downloadAndLoadViewUrlWithFallback() - error reading ${url}`, results.error);
              } else {
                console.log(`downloadAndLoadViewUrlWithFallback() - success reading ${url}`);
                break;
              }
            }

            if (!results.error) {
              const manifestYaml = fs.readFileSync(manifestPath, 'utf8');
              const manifest = manifestYaml && YAML.parse(manifestYaml);
              const projects = manifest?.projects;

              if (projects) {
                const found = projects.find(project => (project?.identifier === bookId));
                let foundPath = found?.path;

                if (foundPath) {
                  // path: './01-GEN.usfm'
                  if (foundPath.substring(0, 2) === './') {
                    foundPath = foundPath.substring(2);
                  }
                  foundUrl = baseUrl + foundPath;
                  results = await dispatch(downloadAndLoadViewUrl(foundUrl, bookId, projectName));
                } else {
                  console.warn(`downloadAndLoadViewUrlWithFallback() - manifest did not have book with ID = ${bookId}`);
                  results.error = `manifest did not have book with ID = ${bookId}`;
                }
              } else {
                console.warn(`downloadAndLoadViewUrlWithFallback() - manifest did not have projects ${JSON.stringify(manifest)}`);
                results.error = 'manifest did not have projects';
              }
            }
          }
        }
      }

      return { ...results, viewUrl: foundUrl };
    } catch (error) {
      console.warn(`downloadAndLoadViewUrlWithFallback() - failed to load ${viewUrl}`, error);
      return { error };
    }
  }
};

/**
 * load USFM file from URL and add to reducer
 * @param {string} viewUrl
 * @param {string} bookId
 * @param {string} projectName
 */
export const downloadAndLoadViewUrl = (viewUrl, bookId, projectName) => async (dispatch) => {
  if (viewUrl) {
    try {
      const importspath = IMPORTS_PATH;
      const viewUrlPath = path.join(importspath, 'viewUrl.usfm');
      const viewPath = VIEW_DATA_PATH;
      const viewJsonPath = path.join(viewPath, `${projectName}.json`);
      fs.ensureDirSync(importspath);

      if (fs.existsSync(viewUrlPath)) {
        fs.removeSync(viewUrlPath);
      }

      const results = await dispatch(downloadFromUrl(viewUrl, viewUrlPath));

      if (!results.error) {
        try {
          let usfm = fs.readFileSync(viewUrlPath, 'utf8');

          if (usfm) {
            const usfmObject = usfmjs.toJSON(usfm);
            const details = getUSFMDetails(usfmObject);

            if (bookId === details?.book?.id) {
              const bibleData = {
                ...usfmObject.chapters,
                manifest: {
                  view_url: viewUrl,
                  description: viewUrl,
                  direction: details?.language?.direction,
                  language_id: details?.language?.id,
                  language_name: details?.language?.name,
                  resource_id: details?.repo,
                },
              };
              fs.ensureDirSync(viewPath);
              fs.writeJsonSync(viewJsonPath, bibleData);
              dispatch(addNewBible('url', 'viewURL', bibleData, projectName));
            } else {
              if (details?.book?.id) {
                console.log(`downloadAndLoadViewUrl() - wrong book in ${viewUrl}, found '${details?.book?.id}', but need '${bookId}'`);
                return { usfm, error: ` Wrong book, found '${details?.book?.id}', but need '${bookId}'` };
              } else {
                console.warn(`downloadAndLoadViewUrl() - Invalid USFM: ${usfm.substring(0, 30)}`);
                return { usfm, error: ` Invalid USFM` };
              }
            }
            return { usfm, usfmObject };
          }
        } catch (error) {
          console.warn(`downloadAndLoadViewUrl() - failed to load ${viewUrl}`, error);
          return { error };
        }
      } else {
        console.warn(`downloadAndLoadViewUrl() - failed to load ${viewUrl}`, results?.error);
        return { error: results?.error };
      }
    } catch (error) {
      console.warn(`downloadAndLoadViewUrl() - failed to load ${viewUrl}`, error);
      return { error };
    }
  }
};

/**
 * load USFM file from URL and add to reducer
 * @param {string} viewUrl
 * @param {string} bookId
 * @param {string} projectName
 */
const loadViewUrl = (viewUrl, bookId, projectName) => (dispatch) => {
  if (viewUrl) {
    try {
      const viewJsonPath = path.join(VIEW_DATA_PATH, `${projectName}.json`);

      if (fs.existsSync(viewJsonPath)) {
        const bibleData = fs.readJsonSync(viewJsonPath);
        dispatch(addNewBible('url', 'viewURL', bibleData, projectName));
      }
    } catch (e) {
      console.log(`loadViewUrl() - failed to load ${viewUrl}`, e);
    }
  }
};

/**
 * show Invalid Version Error
 * @return {Function}
 */
export const showInvalidVersionError = () => (dispatch, getState) => {
  const translate = getTranslate(getState());
  const cancelText = translate('buttons.cancel_button');
  const upgradeText = translate('buttons.update');

  dispatch(openOptionDialog(translate('project_validation.newer_project'),
    (result) => {
      dispatch(closeAlertDialog());

      if (result === upgradeText) {
        dispatch(openSoftwareUpdate());
      }
    }, cancelText, upgradeText));
};

/**
 * show Invalid Original Language Version Error
 * @param {object} manifest
 * @return {Function}
 */
export const showInvalidOrigLangVersionError = (manifest) => (dispatch, getState) => {
  const translate = getTranslate(getState());
  const cancelText = translate('buttons.cancel_button');
  const upgradeText = translate('buttons.update_version');
  const bookId = manifest?.project?.id || '';
  const { bibleId: origLangBibleId, languageId: origLangId } = BibleHelpers.getOrigLangforBook(bookId);
  const origLangOwnerForWA = manifest?.toolsSelectedOwners?.wordAlignment;
  const origLangEditVersionForWA = manifest?.tc_orig_lang_check_version_wordAlignment;
  const missingOLResource = {
    languageId: origLangId,
    resourceId: origLangBibleId,
    version: origLangEditVersionForWA || 'master',
    owner: origLangOwnerForWA || DEFAULT_ORIG_LANG_OWNER,
  };

  console.log(`showInvalidOrigLangVersionError() - get missing OL resource: ${JSON.stringify(missingOLResource)}`);

  dispatch(openOptionDialog(translate('project_validation.newer_project_original_language'),
    (result) => {
      dispatch(closeAlertDialog());

      if (result === upgradeText) {
        dispatch(downloadMissingResource(missingOLResource));
      }
    }, cancelText, upgradeText));
};

/**
 * make sure that the edit versions and minimum compatible versions are up to date in manifest
 * @return {Function}
 */
export const updateProjectVersion = () => (dispatch, getState) => {
  const manifest = getProjectManifest(getState());
  const minVersion = manifest[tc_MIN_COMPATIBLE_VERSION_KEY];
  const editVersion = manifest[tc_EDIT_VERSION_KEY];

  if ((editVersion !== APP_VERSION) || (minVersion !== MIN_COMPATIBLE_VERSION)) {
    dispatch(ProjectDetailsActions.addObjectPropertyToManifest(tc_EDIT_VERSION_KEY, APP_VERSION));
    dispatch(ProjectDetailsActions.addObjectPropertyToManifest(tc_MIN_COMPATIBLE_VERSION_KEY, MIN_COMPATIBLE_VERSION));
  }
};

/**
 * updates the time the project was last opened in the project's settings.json file
 * @return {Function}
 */
export const updateProjectLastOpened = () => (dispatch) => {
  dispatch(ProjectDetailsActions.addObjectPropertyToSettings(tc_LAST_OPENED_KEY, new Date()));
};

/**
 * handles project validation and does prompting of user if project is invalid
 * @param {string} projectDir
 * @param {Function} translate
 * @return {Promise}
 */
const doValidationAndPrompting = (projectDir, translate) => async (dispatch) => {
  let prompted = false;

  await dispatch(validateProject(projectDir, (prompted_) => {
    prompted = prompted_; // save if user was prompted
  }));

  if (prompted) { // reshow the alert dialog
    dispatch(openAlertDialog(translate('projects.loading_project_alert'), true));
    await delay(300); // for UI to update
  }
};

/**
 * creates properties for tools and sends properties to tool before connecting
 * @param {string} projectSaveLocation
 * @param {string} bookId
 * @param {object} tool
 * @return {Promise}
 */
export const connectToolApi = (projectSaveLocation, bookId, tool) => (dispatch, getState) => {
  console.log(`connectToolApi(${tool.name}) - connect tool api`);
  const toolProps = makeToolProps(dispatch, getState(), projectSaveLocation, bookId, tool.name);

  tool.api.triggerWillConnect(toolProps);
};

/**
 * make sure that we have sufficient version of original language for this project
 * @param {string} bookId
 * @param {object} manifest
 * @returns {boolean} return true if we need a newer original language version
 */
function checkIfWeNeedNewerOrigLangVersion(bookId, manifest) {
  if (bookId && manifest && Object.keys(manifest).length) {
    const { bibleId: origLangBibleId, languageId: origLangId } = BibleHelpers.getOrigLangforBook(bookId);
    const bibleFolderPath = path.join(USER_RESOURCES_PATH, origLangId, 'bibles', origLangBibleId);
    const origLangOwnerForWA = manifest?.toolsSelectedOwners?.wordAlignment;
    const origLangEditVersionForWA = manifest?.tc_orig_lang_check_version_wordAlignment;
    console.log(`checkIfWeNeedNewerOrigLangVersion() - WA original lang: ${origLangOwnerForWA}/${origLangId}_${origLangBibleId}, version ${origLangEditVersionForWA}`);
    let latestOlVersion = null;
    let needNewerOrigLang = false;

    if (!origLangEditVersionForWA) {
      console.log(`checkIfWeNeedNewerOrigLangVersion() - has not been edited in wA, so no need to check original language version`);
      return false;
    }

    if (fs.existsSync(bibleFolderPath)) {
      try {
        latestOlVersion = getMostRecentVersionInFolder(bibleFolderPath, origLangOwnerForWA);
        console.log(`checkIfWeNeedNewerOrigLangVersion() - read latestOlVersion: ${latestOlVersion}`);

        if (latestOlVersion) {
          const { version } = resourcesHelpers.splitVersionAndOwner(latestOlVersion);
          latestOlVersion = version;

          if (latestOlVersion[0] === 'v') {
            latestOlVersion = latestOlVersion.substring(1);
          }
        }
      } catch (e) {
        console.warn(`checkIfWeNeedNewerOrigLangVersion() - failed to get latest version in ${bibleFolderPath}`, e);
        latestOlVersion = null;
      }
    }

    console.log(`checkIfWeNeedNewerOrigLangVersion() - final latestOlVersion: ${latestOlVersion}`);

    if (!latestOlVersion || origLangEditVersionForWA && ResourceAPI.compareVersions(latestOlVersion, origLangEditVersionForWA) < 0) {
      console.log(`checkIfWeNeedNewerOrigLangVersion() - needs to download ${origLangEditVersionForWA}`);
      needNewerOrigLang = true;
    }

    console.log(`checkIfWeNeedNewerOrigLangVersion() - needNewerOrigLang: ${needNewerOrigLang}`);
    return needNewerOrigLang;
  }
  return false;
}

/**
 * This thunk opens a project and prepares it for use in tools.
 * @param {string} name - the name of the project
 * @param {boolean} [skipValidation=false] - this is a deprecated hack until the import methods can be refactored
 */
export const openProject = (name, skipValidation = false) => async (dispatch, getState) => {
  const projectDir = path.join(PROJECTS_PATH, name);
  const translate = getTranslate(getState());
  console.log('openProject() projectDir=' + projectDir);
  let manifest = null;

  try {
    dispatch(openAlertDialog(translate('projects.loading_project_alert'), true));
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch(initializeReducersForProjectOpenValidation());

    // TRICKY: prevent dialog from flashing on small projects
    await delay(200);
    await isProjectSupported(projectDir, translate);
    await migrateProject(projectDir, null, getUsername(getState()));

    // TODO: this is a temporary hack. Eventually we will always validate the project
    // but we need to refactored the online and local import functions first so there is no duplication.
    if (!skipValidation) {
      await dispatch(doValidationAndPrompting(projectDir, translate));
    }

    // TRICKY: validation may have changed the project path
    const validProjectDir = getProjectSaveLocation(getState());
    console.log('openProject() validProjectDir=' + validProjectDir);

    // load target book
    console.log('openProject() - loading target book');
    dispatch(loadTargetLanguageBook());

    // connect the tools
    manifest = getProjectManifest(getState());
    const tools = getTools(getState());
    const bookId = manifest?.project?.id || '';

    if (checkIfWeNeedNewerOrigLangVersion(bookId, manifest)) {
      throw (tc_MIN_UGNT_ERROR);
    }

    dispatch(loadViewUrl(manifest?.view_url, bookId, name));

    for (const t of tools) {
      // load source book translations
      console.log(`openProject() - loading source book ${bookId} into ${t.name}`);
      await dispatch(loadSourceBookTranslations(bookId, t.name));
      const gatewayLanguage = getToolGatewayLanguage(getState(), t.name);
      const glOwner = getToolGlOwner(getState(), t.name) || DEFAULT_OWNER;

      // copy group data
      // TRICKY: group data must be tied to the original language for tW and GL for tN
      console.log('openProject() - copy group data');
      let copyLang = gatewayLanguage;

      if (t.name === TRANSLATION_WORDS) {
        if (glOwner === apiHelpers.DOOR43_CATALOG) { // for tW we use OrigLang if owner is D43 Catalog
          const olForBook = BibleHelpers.getOrigLangforBook(bookId);
          copyLang = (olForBook && olForBook.languageId) || Bible.NT_ORIG_LANG;
        }
      }
      copyGroupDataToProject(copyLang, t.name, validProjectDir, dispatch, false, glOwner);

      // select default categories
      setDefaultProjectCategories(gatewayLanguage, t.name, validProjectDir, glOwner);

      dispatch(connectToolApi(validProjectDir, bookId, t));
    }

    await dispatch(displayTools());
    dispatch(updateProjectVersion());
    dispatch(updateProjectLastOpened());
    console.log('openProject() - project opened');
    dispatch(closeAlertDialog());
  } catch (e) {
    // TODO: clean this up
    if (e.type !== 'div') {
      console.warn('openProject() error', e);
    }

    let message = e.stack ? e.message : e; // if crash dump, need to clean up message so it doesn't crash alert
    console.warn('openProject() error message', message);
    // clear last project must be called before any other action.
    // to avoid triggering autosaving.
    dispatch(closeProject());

    switch (message) {
    case tc_MIN_UGNT_ERROR:
      dispatch(showInvalidOrigLangVersionError(manifest));
      break;
    case tc_MIN_VERSION_ERROR:
      dispatch(showInvalidVersionError());
      break;
    default:
      dispatch(openAlertDialog(translate('projects.error_loading', { email: translate('_.help_desk_email') })));
      break;
    }

    dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
  }
};

/**
 * TODO: this is very similar to what is in the {@link ToolContainer} and probably needs to be abstracted.
 * This is just a temporary prop generator until we can properly abstract the tc api.
 * @param {Function} dispatch
 * @param {Object} state
 * @param {String} projectDir
 * @param {String} bookId
 * @param {String} toolName
 * @returns {Object}
 */
function makeToolProps(dispatch, state, projectDir, bookId, toolName) {
  const projectApi = new ProjectAPI(projectDir);
  const coreApi = new CoreAPI(dispatch);
  const resourceApi = ResourceAPI;
  const { code } = getActiveLocaleLanguage(state);
  const gatewayLanguageOwner = getToolGlOwner(state, toolName) || DEFAULT_ORIG_LANG_OWNER;
  const sourceBook = getSourceBook(state, getOriginalLangOwner(gatewayLanguageOwner));
  const targetBook = getTargetBook(state);
  const gatewayLanguageCode = getToolGatewayLanguage(state, toolName);

  return {
    //resource api
    resources: resourceApi,
    // project api
    project: projectApi,
    projectSaveLocation: projectDir,

    // flattened project api methods that may be deprecated in the future.
    readProjectDataDir: projectApi.readDataDir,
    readProjectDataDirSync: projectApi.readDataDirSync,
    writeProjectData: projectApi.writeDataFile,
    writeProjectDataSync: projectApi.writeDataFileSync,
    readProjectData: projectApi.readDataFile,
    readProjectDataSync: projectApi.readDataFileSync,
    projectDataPathExists: projectApi.dataPathExists,
    projectDataPathExistsSync: projectApi.dataPathExistsSync,
    deleteProjectFile: projectApi.deleteDataFile,

    // tC api
    showDialog: coreApi.showDialog,
    showLoading: coreApi.showLoading,
    closeLoading: coreApi.closeLoading,
    showIgnorableAlert: coreApi.showIgnorableAlert,
    appLanguage: code,
    projects: getProjects(state).map(p => new ProjectAPI(p.projectSaveLocation)),

    // project data
    sourceBook,
    targetBook,

    bookId,
    toolName,
    gatewayLanguageCode,
    gatewayLanguageOwner,

    contextId: {
      reference: {
        bookId,
        chapter: '1', // TRICKY: just some dummy values at first
        verse: '1',
      },
    },
    username: getUsername(state),
    toolsSelectedGLs: getToolsSelectedGLs(state),
    // deprecated props
    readProjectDir: (...args) => {
      console.warn('DEPRECATED: readProjectDir is deprecated. Use readProjectDataDir instead.');
      return projectApi.readDataDir(...args);
    },
    readProjectDirSync: (...args) => {
      console.warn('DEPRECATED: readProjectDirSync is deprecated. Use readProjectDataDirSync instead.');
      return projectApi.readDataDirSync(...args);
    },
    showIgnorableDialog: (...args) => {
      console.warn('DEPRECATED: showIgnorableDialog is deprecated. Use showIgnorableAlert instead');
      return coreApi.showIgnorableAlert(...args);
    },
    get toolsReducer() {
      console.warn(`DEPRECATED: toolsReducer is deprecated.`);
      return {};
    },
    projectFileExistsSync: (...args) => {
      console.warn(`DEPRECATED: projectFileExistsSync is deprecated. Use pathExistsSync instead.`);
      return projectApi.dataPathExistsSync(...args);
    },
  };
}

/**
 * @description - Opening the tools screen upon making sure the project is
 * not a titus or in the user is in developer
 */
export function displayTools() {
  return (dispatch, getState) => {
    const state = getState();
    const translate = getTranslate(state);
    return new Promise ((resolve, reject) => {
      try {
        const { currentSettings } = state.settingsReducer;
        const { manifest } = state.projectDetailsReducer;

        if (manifestHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
          // Go to toolsCards page
          dispatch(BodyUIActions.goToStep(3));
        } else {
          dispatch(RecentProjectsActions.getProjectsFromFolder());
          reject(translate('projects.books_available', { app: translate('_.app_name') }));
        }
      } catch (error) {
        console.error(error);
        reject(error);
      }
      resolve();
    });
  };
}

/**
 * @description - Wrapper to clear everything in the store that could
 * prevent a new project from loading
 */
export function closeProject() {
  return (dispatch, getState) => {
    // disconnect from the tools
    const state = getState();
    const toolApi = getSelectedToolApi(state);
    const supportingToolApis = getSupportingToolApis(state);

    for (const key of Object.keys(supportingToolApis)) {
      try {
        supportingToolApis[key].triggerWillDisconnect();
      } catch (e) {
        console.warn(`Failed to disconnect from ${key}`, e);
      }
    }

    if (toolApi) {
      try {
        toolApi.triggerWillDisconnect();
      } catch (e) {
        console.warn(`Failed to disconnect from the current tool`, e);
      }
    }

    /**
     * ATTENTION: The project details reducer must be reset
     * before any other action being called to avoid
     * autosaving messing up with the project data.
     */
    const actions = [
      { type: consts.RESET_PROJECT_DETAIL },
      BodyUIActions.toggleHomeView(true),
      ProjectDetailsActions.resetProjectDetail(),
      { type: consts.CLOSE_TOOL },
      { type: consts.CLEAR_RESOURCES_REDUCER },
    ];

    dispatch(batchActions(actions));
  };
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 * @param {object} settings - project settings object
 */
export function loadProjectDetails(projectPath, manifest, settings) {
  return (dispatch) => {
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
    dispatch(ProjectDetailsActions.setProjectSettings(settings));
  };
}
