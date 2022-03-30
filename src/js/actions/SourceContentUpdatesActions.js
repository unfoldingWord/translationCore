/* eslint-disable require-await */
/* eslint-disable require-await */
import path from 'path-extra';
import sourceContentUpdater, { apiHelpers } from 'tc-source-content-updater';
import env from 'tc-electron-env';
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
import { DEFAULT_ORIG_LANG_OWNER } from '../common/constants';
import { loadBookTranslations } from './ResourcesActions';
import { updateResourcesForOpenTool } from './OriginalLanguageResourcesActions';
import {
  openAlertDialog,
  closeAlertDialog,
  openOptionDialog,
} from './AlertModalActions';
import consts from './ActionTypes';
import { confirmOnlineAction } from './OnlineModeConfirmActions';
// constants
const SourceContentUpdater = new sourceContentUpdater();
const USER_RESOURCES_PATH = path.join(env.home(), 'translationCore/resources');

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
 * Gets the list of source content that needs or can be updated.
 * @param {function} closeSourceContentDialog - Hacky workaround to close the
 * source content dialog in the AppMenu state.
 */
export const getListOfSourceContentToUpdate = async (closeSourceContentDialog) => (async (dispatch, getState) => {
  const translate = getTranslate(getState());
  dispatch(resetSourceContentUpdatesReducer());

  if (navigator.onLine) {
    dispatch(openAlertDialog(translate('updates.checking_for_source_content_updates'), true));
    const localResourceList = apiHelpers.getLocalResourceList(USER_RESOURCES_PATH);

    await SourceContentUpdater.getLatestResources(localResourceList)
      .then(resources => {
        dispatch(closeAlertDialog());

        if (resources.length > 0) {
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
            () => getListOfSourceContentToUpdate(closeSourceContentDialog),
            'updates.failed_checking_for_source_content_updates',
          ),
        );
      });
  } else {
    dispatch(openAlertDialog(translate('no_internet')));
    closeSourceContentDialog();
  }
});

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
 */
export const downloadSourceContentUpdates = (resourcesToDownload, refreshUpdates = false) => (async (dispatch, getState) => {
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
      await SourceContentUpdater.getLatestResources(localResourceList);
    }

    cancelled = false;
    await SourceContentUpdater.downloadAllResources(USER_RESOURCES_PATH, resourcesToDownload, 20)
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
                () => downloadSourceContentUpdates(resourcesToDownload, true),
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
      await SourceContentUpdater.downloadAndProcessResource(resourceDetails, USER_RESOURCES_PATH)
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
