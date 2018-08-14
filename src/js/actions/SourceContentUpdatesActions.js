import consts from './ActionTypes';
import {getTranslate} from '../selectors';
import {openAlertDialog, closeAlertDialog} from './AlertModalActions';

import sourceContentUpdater from 'tc-source-content-updater';
const SourceContentUpdater = new sourceContentUpdater();

const mockLocalResourceList = [
  {
    languageId: 'Tamil',
    resourceId: 'ulb',
    modifiedTime: '2018-06-01T19:08:11+00:00'
  },
  {
    languageId: 'Tamil',
    resourceId: 'tW',
    modifiedTime: '2018-06-01T19:08:11+00:00'
  },
  {
    languageId: 'Hausa',
    resourceId: 'ult',
    modifiedTime: '2018-06-01T19:08:11+00:00'
  }
];
const mockResources = [
  {
    languageName: 'Tamil',
    languageId: 'ta',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'Hausa',
    languageId: 'ha',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'Kannada',
    languageId: 'kn',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'kiswahili',
    languageId: 'sw',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'vietnamese',
    languageId: 'vi',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'espanol',
    languageId: 'es',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  }
];

/**
 * Resets the state of the source content updates reducer.
 */
export const resetSourceContentUpdatesReducer = () => ({
  type: consts.RESET_LIST_OF_SOURCE_CONTENT_TO_UPDATE
});

/**
 * Gets the list of source content that needs or can be updated.
 */
export const getListOfSourceContentToUpdate = () => {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.checking_for_source_content_updates'), true));
      // TODO: STOP USING MOCK DATA.
      await SourceContentUpdater.getLatestResources(mockLocalResourceList)
        .then(() =>
          dispatch({
            type: consts.NEW_LIST_OF_SOURCE_CONTENT_TO_UPDATE,
            resources: mockResources
          })
        )
        .catch((err) => {
          console.warn(err);
          dispatch(openAlertDialog(translate('updates.failed_checking_for_source_content_updates')));
        });
      dispatch(closeAlertDialog());
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
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
    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.downloading_source_content_updates'), true));

      await SourceContentUpdater.downloadResources(languageIdListToDownload)
        .then(() =>
          dispatch(openAlertDialog(translate('updates.source_content_updates_successful_download'))))
        .catch((err) => {
          console.warn(err);
          dispatch(openAlertDialog(translate('updates.source_content_updates_unsuccessful_download')));
        });
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
    }
  });
};
