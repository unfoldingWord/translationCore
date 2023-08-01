/* eslint-disable require-await */
/* eslint-disable require-await */
import path from 'path-extra';
import fs from 'fs-extra';
import sourceContentUpdater, { apiHelpers } from 'tc-source-content-updater';
import {
  getCurrentToolName,
  getProjectSaveLocation,
  getProjectBookId,
  getToolGlOwner,
  getTranslate,
} from '../selectors';
import { getResourceDownloadsAlertMessage } from '../containers/SourceContentUpdatesDialogContainer';
// helpers
import { copyGroupDataToProject, updateSourceContentUpdaterManifest } from '../helpers/ResourcesHelpers';
import { getOrigLangforBook } from '../helpers/bibleHelpers';
import * as Bible from '../common/BooksOfTheBible';
import { sendUpdateResourceErrorFeedback } from '../helpers/FeedbackHelpers';
// actions
import {
  DCS_BASE_URL,
  DEFAULT_ORIG_LANG_OWNER,
  USER_RESOURCES_PATH,
  USFMJS_VERSION,
} from '../common/constants';
import { getCurrentPaneSetting } from '../helpers/SettingsHelpers';
import { loadBookTranslations } from './ResourcesActions';
import { updateResourcesForOpenTool } from './OriginalLanguageResourcesActions';
import {
  openAlertDialog,
  closeAlertDialog,
  openOptionDialog,
} from './AlertModalActions';
import consts from './ActionTypes';
import { confirmOnlineAction } from './OnlineModeConfirmActions';
import * as SettingsActions from './SettingsActions';
// constants
const SourceContentUpdater = new sourceContentUpdater();

/**
 * Resets the state of the source content updates reducer.
 */
export const resetSourceContentUpdatesReducer = () => ({ type: consts.RESET_LIST_OF_SOURCE_CONTENT_TO_UPDATE });

export const updateSourceContentUpdatesReducer = () => ({ type: consts.INCREMENT_SOURCE_CONTENT_UPDATE_COUNT });

const failedAlertAndRetry = (closeSourceContentDialog, retryCallback, failAlertMessage, failAlertString = null) => ((dispatch, getState) => {
  const translate = getTranslate(getState());

  dispatch(
    openOptionDialog(
      failAlertString || translate(failAlertMessage),
      () => dispatch(retryCallback()),
      translate('buttons.retry'),
      translate('buttons.cancel_button'),
      null,
      () => {
        dispatch(closeAlertDialog());
        closeSourceContentDialog();
      },
    ),
  );
});

/**
 * consolidate any twl and tw downloads
 * @param languageResources
 * @returns {*}
 */
function consolidateTwls(languageResources) {
  for (let i = 0; i < languageResources.length; i++) {
    const languageResource = languageResources[i];
    const resources = languageResource?.resources;

    if (languageResource?.languageId) {
      const resources_ = [];

      for (const resource of resources) {
        if (resource.resourceId === 'twl') {
          const matchingTW = resources.find(res => (
            (res.resourceId === 'tw') &&
            (res.owner === resource.owner) &&
            (res.languageId === resource.languageId)
          ));

          if (matchingTW) {
            continue; // skip over this, since it will be downloaded automatically with TW
          }
        }

        resources_.push(resource);
      }
      languageResource.resources = resources_;
    }
  }
  return languageResources;
}

/**
 * create error string from array of errors
 * @param {array} errors
 * @param {function} translate
 * @return {String}
 */
function getDownloadErrorList(errors, translate) {
  let errorStr = '';

  for (const error of errors) {
    let errorSuffix = '';
    let errorType = error.parseError ? 'updates.update_error_reason_parse' : 'updates.update_error_reason_download';

    if (error.parseError) {
      const matches = [
        { start: ' - cannot find \'', end: '\'' },
        { start: 'Failed to process resource: ', end: ':' },
      ];

      for (const match of matches) {
        if (error.errorMessage.indexOf(match.start) >= 0) {
          const [, suffix] = error.errorMessage.split(match.start);
          errorSuffix = suffix.split(match.end)[0];
          errorType = 'updates.update_error_reason_missing_dependency';
          break;
        }
      }
    }
    errorSuffix = errorSuffix || '';

    if (errorSuffix) {
      errorSuffix = ': ' + errorSuffix;
    }
    errorStr += `${error.downloadUrl} ⬅︎ ${translate(errorType)}${errorSuffix}\n`;
  }
  return errorStr;
}

/**
 * Downloads source content updates using the tc-source-content-updater.
 * @param {array} resourcesToDownload - list of resources to be downloaded.
 * @param {boolean} refreshUpdates
 * @param {boolean} preRelease
 * @returns {(function(*, *): Promise<void>)|*}
 */
export function downloadSourceContentUpdates(resourcesToDownload, refreshUpdates = false, preRelease = false) {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    const toolName = getCurrentToolName(getState());
    let cancelled = false;

    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.downloading_source_content_updates'),
        true,
        translate('buttons.cancel_button'),
        () => { // cancel actions
          cancelled = true;
          SourceContentUpdater.cancelDownload();
          dispatch(openAlertDialog(translate('updates.downloads_canceled')));
        }));

      if (refreshUpdates) {
        const localResourceList = apiHelpers.getLocalResourceList(USER_RESOURCES_PATH);
        const resourcesNotDownloaded = resourcesToDownload.filter(resourceToDownload => {
          const downloadVersion = 'v' + resourceToDownload.version;
          const matchedResource = localResourceList.find(existingResource => {
            const match = (existingResource.version === downloadVersion) &&
              (existingResource.languageId === resourceToDownload.languageId) &&
              (existingResource.resourceId === resourceToDownload.resourceId) &&
              (existingResource.owner === resourceToDownload.owner);
            return match;
          });
          return !matchedResource;
        });
        resourcesToDownload = resourcesNotDownloaded; // only download resources still missing
        const latestManifestKey = { Bible: { 'usfm-js': USFMJS_VERSION } };
        const config = {
          filterByOwner: null,
          latestManifestKey,
          stage: preRelease ? 'preprod' : null,
        };

        await SourceContentUpdater.getLatestResources(localResourceList, config);
      }

      cancelled = false;
      await SourceContentUpdater.downloadAllResources(USER_RESOURCES_PATH, resourcesToDownload)
        .then(async () => {
          updateSourceContentUpdaterManifest();
          dispatch(updateSourceContentUpdatesReducer());

          // if tool is opened then load new bible resources
          if (toolName) {
            const projectSaveLocation = getProjectSaveLocation(getState());
            const bookId = getProjectBookId(getState());
            const olForBook = getOrigLangforBook(bookId);
            const glOwner = getToolGlOwner(getState(), toolName) || DEFAULT_ORIG_LANG_OWNER;
            let helpDir = (olForBook && olForBook.languageId) || Bible.NT_ORIG_LANG;
            await dispatch(loadBookTranslations(bookId));

            // update resources used by tool
            dispatch(updateResourcesForOpenTool(toolName));

            // Tool is opened so we need to update existing group data
            copyGroupDataToProject(helpDir, toolName, projectSaveLocation, dispatch, false, glOwner);
          }

          if (cancelled) {
            console.error('downloadSourceContentUpdates() - download cancelled, no errors');
            dispatch(closeAlertDialog());
          } else {
            dispatch(openAlertDialog(translate('updates.source_content_updates_successful_download')));
          }
        })
        .catch((err) => {
          if (cancelled) {
            console.error('downloadSourceContentUpdates() - download cancelled, errors:', err);
          } else {
            console.error('downloadSourceContentUpdates() - error:', err);

            const showDownloadErrorAlert = (alertMessage) => {
              dispatch(
                failedAlertAndRetry(
                  () => dispatch(closeAlertDialog()),
                  () => downloadSourceContentUpdates(resourcesToDownload, true, preRelease),
                  null,
                  alertMessage,
                ),
              );
            };

            const errors = SourceContentUpdater.downloadErrors;
            let errorStr = '';
            let alertMessage = err.toString(); // default error message

            if (errors && errors.length) {
              errorStr = getDownloadErrorList(errors, translate);
              alertMessage = getResourceDownloadsAlertMessage(translate, errorStr, () => { // on feedback button click
                dispatch(closeAlertDialog()); // hide the alert dialog so it does not display over the feedback dialog
                dispatch(sendUpdateResourceErrorFeedback('\nFailed to download source content updates:\n' + errorStr, () => {
                  showDownloadErrorAlert(alertMessage); // reshow alert dialog
                }));
              });
            }
            showDownloadErrorAlert(alertMessage);
          }
        });
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
    }
  });
}

/**
 * Downloads a given resource from the door43 catalog via
 * the tc-source-content-updater.
 * @param {object} resourceDetails - Details about the resource.
 * { languageId: 'en', resourceId: 'ult', version: 0.8 }
 * @param {string} resourceDetails.languageId The language Id of the resource.
 * @param {string} resourceDetails.resourceId The resource Id of the resource.
 * @param {number} resourceDetails.version The version of the resource.
 */
export const downloadMissingResource = (resourceDetails) => (async (dispatch, getState) => {
  const translate = getTranslate(getState());

  if (navigator.onLine) {
    dispatch(confirmOnlineAction(async () => {
      dispatch(openAlertDialog(translate('updates.downloading_source_content_updates'), true));
      const config = { DCS_BASE_URL };

      await SourceContentUpdater.downloadAndProcessResource(resourceDetails, USER_RESOURCES_PATH, config)
        .then(async () => {
          updateSourceContentUpdaterManifest();
          dispatch(updateSourceContentUpdatesReducer());
          const successMessage = translate('updates.source_content_updates_successful_download');
          dispatch(openAlertDialog(successMessage));
        })
        .catch((err) => {
          console.error(err);
          dispatch(
            failedAlertAndRetry(
              () => dispatch(closeAlertDialog()),
              () => downloadMissingResource(resourceDetails),
              'updates.source_content_updates_unsuccessful_download',
            ),
          );
        });
    }));
  } else {
    dispatch(openAlertDialog(translate('no_internet')));
  }
});

/**
 * Prompts the user about a missing resource needed by the tool.
 * @param {object} resourceDetails - Details about the resource.
 * { languageId: 'en', resourceId: 'ult', version: 0.8 }
 * @param {string} resourceDetails.languageId The language Id of the resource.
 * @param {string} resourceDetails.resourceId The resource Id of the resource.
 * @param {number} resourceDetails.version The version of the resource.
 */
export const promptUserAboutMissingResource = (resourceDetails) => (async (dispatch, getState) => {
  const translate = getTranslate(getState());
  const { resourceId } = resourceDetails;

  dispatch(
    openOptionDialog(
      translate('tools.resource_missing_for_tool', { resourceId: resourceId.toUpperCase() }),
      () => dispatch(downloadMissingResource(resourceDetails)),
      translate('updates.download'),
      translate('buttons.cancel_button'),
      null,
      () => dispatch(closeAlertDialog()),
    ),
  );
});

/**
 * gets all the sub folders of folder
 * @param {string} folder
 * @returns {*[]}
 */
function readSubDirs(folder) {
  const alignmentFolders = [];

  if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
    fs.readdirSync(folder).forEach(subFolder => {
      const subFolderPath = path.join(folder, subFolder);

      if (fs.statSync(subFolderPath).isDirectory() && (folder !== '.DS_Store')) {
        alignmentFolders.push(subFolderPath);
      }
    });
  }
  return alignmentFolders;
}

/**
 * gets all the sub folders of all the folders
 * @param {array} folders
 * @returns {[]}
 */
function readSubDirsOfArray(folders) {
  let subFolders = [];

  for (const folder of folders) {
    const subFolders_ = readSubDirs(folder);
    subFolders = subFolders.concat(subFolders_);
  }

  return subFolders;
}

/**
 * gets all the paths to the versions of all resources in resourcesFolder
 * @param {string} resourcesFolder
 * @returns {*[]}
 */
function getAllResourceVersions(resourcesFolder) {
  const languages = readSubDirs(resourcesFolder);
  const resourceTypes = readSubDirsOfArray(languages);
  const subResourceTypes = readSubDirsOfArray(resourceTypes);
  const versions = readSubDirsOfArray(subResourceTypes);
  return versions;
}

/**
 * get a list of all resources in resourcesFolder
 * @param {string} resourcesFolder
 * @returns {[]}
 */
export function getAllResourceManifests(resourcesFolder) {
  let manifests = [];
  const versions = getAllResourceVersions(resourcesFolder);

  for (const versionPath of versions) {
    const manifestPath = path.join(versionPath, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = fs.readJsonSync(manifestPath);

        if (manifest) {
          manifests.push({
            manifest,
            manifestPath,
            resourcePath: versionPath,
          });
        }
        // eslint-disable-next-line no-empty
      } catch (e) { }
    }
  }

  return manifests;
}

/**
 * delete prerelease resources in resourcesFolder
 * @param {string} resourcesFolder
 */
export const deletePreReleaseResources = (resourcesFolder) => ((dispatch, getState) => {
  const resources = getAllResourceManifests(resourcesFolder);
  const preReleases = resources.filter(resource => (resource.manifest && resource.manifest.stage === 'preprod'));

  for (const preRelease of preReleases) {
    console.log(`deletePreReleaseResources() - deleting ${preRelease.resourcePath}`);

    try {
      fs.removeSync(preRelease.resourcePath);
    } catch (e) {
      console.error(`deletePreReleaseResources() - could not delete ${preRelease.resourcePath}`, e);
    }
  }

  const currentPaneSettings = getCurrentPaneSetting(getState()) || [];
  let changed = false;

  for (let i = 0; i < currentPaneSettings.length; i++) {
    const pane = currentPaneSettings[i];

    if (pane.isPreRelease) {
      delete pane.isPreRelease;
      changed = true;
    }
  }

  if (changed) {
    dispatch(SettingsActions.setToolSettings('ScripturePane', 'currentPaneSettings', currentPaneSettings));
  }
});

/**
 * Gets the list of source content that needs or can be updated.
 * @param {function} closeSourceContentDialog - Hacky workaround to close the
 * source content dialog in the AppMenu state.
 * @param {boolean} preRelease - if true include pre-release content
 */
export function getListOfSourceContentToUpdate(closeSourceContentDialog, preRelease = false) {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.checking_for_source_content_updates'), true));
      const localResourceList = apiHelpers.getLocalResourceList(USER_RESOURCES_PATH);
      const latestManifestKey = { Bible: { 'usfm-js': USFMJS_VERSION } };
      const config = {
        filterByOwner: null,
        latestManifestKey,
        stage: preRelease ? 'preprod' : null,
        DCS_BASE_URL,
      };

      await SourceContentUpdater.getLatestResources(localResourceList, config)
        .then(resources => {
          dispatch(closeAlertDialog());

          if (resources.length > 0) {
            resources = consolidateTwls(resources);

            dispatch({
              type: consts.NEW_LIST_OF_SOURCE_CONTENT_TO_UPDATE,
              resources,
            });
          } else {
            closeSourceContentDialog();
            dispatch(openAlertDialog(translate('updates.source_content_up_to_date')));
          }
        })
        .catch((err) => {
          console.error(err, 'Local Resource List:', localResourceList);
          dispatch(
            failedAlertAndRetry(
              closeSourceContentDialog,
              () => getListOfSourceContentToUpdate(closeSourceContentDialog, preRelease),
              'updates.failed_checking_for_source_content_updates',
            ),
          );
        });
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
      closeSourceContentDialog();
    }
  });
}
