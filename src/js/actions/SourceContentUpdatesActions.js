import consts from './ActionTypes';
import {getTranslate} from '../selectors';
import {openAlertDialog, closeAlertDialog} from './AlertModalActions';

const resources = [
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

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

export const resetSourceContentUpdatesReducer = () => ({
  type: consts.RESET_LIST_OF_SOURCE_CONTENT_TO_UPDATE
});

export const getListOfSourceContentToUpdate = () => {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.checking_for_source_content_updates'), true));

      await delay(4000); // simulating data fetching that the source-content-updater module will do.

      dispatch(closeAlertDialog());

      dispatch({
        type: consts.NEW_LIST_OF_SOURCE_CONTENT_TO_UPDATE,
        resources
      });
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
    }
  });
};

export const downloadSourceContentUpdates = () => {
  return (async (dispatch, getState) => {
    const translate = getTranslate(getState());
    dispatch(resetSourceContentUpdatesReducer());

    if (navigator.onLine) {
      dispatch(openAlertDialog(translate('updates.downloading_source_content_updates'), true));

      await delay(4000); // simulating download of source content updates.

      dispatch(openAlertDialog(translate('updates.source_content_updates_successful_download')));

      // if error
      // dispatch(openAlertDialog(translate('updates.source_content_updates_unsuccessful_download')));
    } else {
      dispatch(openAlertDialog(translate('no_internet')));
    }
  });
};
