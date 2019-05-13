import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import sourceContentUpdater from 'tc-source-content-updater';
import consts from './ActionTypes';
import {getTranslate, getContext, getSelectedToolName, getProjectSaveLocation, getProjectBookId} from '../selectors';
import {openAlertDialog, closeAlertDialog, openOptionDialog} from './AlertModalActions';
import { loadBookTranslations } from './ResourcesActions';
// helpers
import { getLocalResourceList } from '../helpers/sourceContentUpdatesHelpers';
import {copyGroupDataToProject, updateSourceContentUpdaterManifest} from '../helpers/ResourcesHelpers';
import {getOLforBook} from '../helpers/bibleHelpers';
import * as Bible from "../common/BooksOfTheBible";
// constants
const SourceContentUpdater = new sourceContentUpdater();
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');

/**
 * Resets the state of the source content updates reducer.
 */
export const resetSourceContentUpdatesReducer = () => ({
  type: consts.RESET_LIST_OF_SOURCE_CONTENT_TO_UPDATE
});

const failedGettingLatestResourcesAndRetry = (closeSourceContentDialog) => {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(
      openOptionDialog(
        translate('updates.failed_checking_for_source_content_updates'),
        () => dispatch(getListOfSourceContentToUpdate(closeSourceContentDialog)),
        translate('buttons.retry'),
        translate('buttons.cancel_button'),
        null,
        () => {
          dispatch(closeAlertDialog());
          closeSourceContentDialog();
        }
      ),
    );
  });
};

/**
 * Gets the list of source content that needs or can be updated.
 * @param {function} closeSourceContentDialog - Hacky workaround to close the
 * source content dialog in the AppMenu state.
 */
export const getListOfSourceContentToUpdate = async (closeSourceContentDialog) => {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.checking_for_source_content_updates'), true));
      const localResourceList = getLocalResourceList();
      await SourceContentUpdater.getLatestResources(localResourceList)
        .then(resources => {
          dispatch(closeAlertDialog());
          if (resources.length > 0) {
            dispatch({
              type: consts.NEW_LIST_OF_SOURCE_CONTENT_TO_UPDATE,
              resources
            });
          } else {
            closeSourceContentDialog();
            dispatch(openAlertDialog(translate('updates.source_content_up_to_date')));
          }
        })
        .catch((err) => {
          console.error(err, 'Local Resource List:', localResourceList);
          dispatch(failedGettingLatestResourcesAndRetry(closeSourceContentDialog));
        });
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
      closeSourceContentDialog();
    }
  });
};

/**
 * Downloads source content updates using the tc-source-content-updater.
 * @param {array} languageIdListToDownload - list of language Ids selected to be downloaded.
 */
export const downloadSourceContentUpdates = (languageIdListToDownload) => {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    const contextId = getContext(getState());
    const toolName = getSelectedToolName(getState());

    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.downloading_source_content_updates'), true));

      await SourceContentUpdater.downloadResources(languageIdListToDownload, USER_RESOURCES_PATH)
        .then(async () => {
          updateSourceContentUpdaterManifest();

          // if tool currently opened then load new bible resources
          if (toolName) {
            const projectSaveLocation = getProjectSaveLocation(getState());
            const bookId = getProjectBookId(getState());
            const olForBook = getOLforBook(bookId);
            let helpDir = (olForBook && olForBook.languageId) || Bible.NT_ORIG_LANG;
            await dispatch(loadBookTranslations(contextId.reference.bookId));
            //Tool is open so we need to update existing group data
            copyGroupDataToProject(helpDir, toolName, projectSaveLocation);
          }
          dispatch(openAlertDialog(translate('updates.source_content_updates_successful_download')));
        })
        .catch((err) => {
          console.error(err);
          dispatch(openAlertDialog(translate('updates.source_content_updates_unsuccessful_download')));
        });
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
    }
  });
};
