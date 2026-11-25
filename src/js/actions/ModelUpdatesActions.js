import React from 'react';
import { getTranslate } from '../selectors';
import { openAlertDialog, closeAlertDialog } from './AlertModalActions';

/**
 * @return {object|null} the AI models API from electronite/preloadAiApi.js, or null if this bridge doesn't have it
 */
export function getModelsApi() {
  const ai = typeof window !== 'undefined' ? (window.AiAPIs || null) : null;
  return (ai && ai.features && ai.features.modelUpdates && ai.models) || null;
}

/**
 * Model updates only matter when the bundled llama-server can run here (it isn't bundled for every platform,
 * e.g. Windows ia32).
 * @return {Promise<boolean>} true if the models API exists and the local server is available
 */
export async function isLocalServerAvailable() {
  const ai = typeof window !== 'undefined' ? (window.AiAPIs || null) : null;

  if (!getModelsApi() || !ai.features.localServer || typeof ai.localServer?.getStatus !== 'function') {
    return false;
  }

  try {
    const status = await ai.localServer.getStatus();
    return !!(status && status.available);
  } catch (e) {
    console.warn('isLocalServerAvailable() - could not get the local server status', e);
    return false;
  }
}

/**
 * @param {number} bytes
 * @return {string} e.g. '1.2 GB'
 */
export function formatBytes(bytes) {
  if (typeof bytes !== 'number' || !isFinite(bytes)) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${unit ? value.toFixed(1) : value} ${units[unit]}`;
}

/**
 * @param {string} heading
 * @param {string[]} lines - details, one per line
 * @return {JSX.Element} alert message (alerts don't show '\n' as line breaks)
 */
export function messageWithDetails(heading, lines) {
  return (
    <div>
      {heading}
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          <br/>
          {line}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Checks the local AI models against the release (see electronite/modelUpdater.js).
 * Shows a "checking" alert while it runs, and an alert if everything is up to date or the check fails.
 * @param {function} onUpdates - called with the list of models to offer when there are updates
 * @param {function} onDone - called when there's nothing to show (up to date or failed)
 * @return {function} thunk
 */
export function checkForModelUpdates(onUpdates, onDone) {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    const modelsApi = getModelsApi();

    if (!modelsApi) {
      console.error('checkForModelUpdates() - the AI models API is not available');
      dispatch(openAlertDialog(translate('updates.failed_checking_for_model_updates')));
      onDone && onDone();
      return;
    }

    dispatch(openAlertDialog(translate('updates.checking_for_model_updates'), true));

    try {
      const { updates } = await modelsApi.checkForUpdates();

      if (updates && updates.length) {
        dispatch(closeAlertDialog());
        onUpdates(updates);
      } else {
        dispatch(openAlertDialog(translate('updates.models_up_to_date')));
        onDone && onDone();
      }
    } catch (e) {
      console.error('checkForModelUpdates() - error:', e);
      dispatch(openAlertDialog(messageWithDetails(
        translate('updates.failed_checking_for_model_updates'), [String(e && e.message || e)],
      )));
      onDone && onDone();
    }
  };
}

/**
 * Downloads the chosen models, showing progress (with a cancel button) in the alert dialog.
 * @param {Array<object>} models - from checkForModelUpdates()
 * @return {function} thunk
 */
export function downloadModelUpdates(models) {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());
    const modelsApi = getModelsApi();

    if (!modelsApi || !models || !models.length) {
      return;
    }

    let cancelled = false;

    const onCancel = () => {
      cancelled = true;
      modelsApi.cancelDownload();
      dispatch(openAlertDialog(translate('updates.models_download_canceled')));
    };

    const showProgress = (progress) => {
      if (cancelled) {
        return;
      }

      const percent = progress && progress.total ?
        Math.floor((progress.received * 100) / progress.total) : 0;
      const message = translate('updates.downloading_model', {
        name: progress ? progress.name : '',
        index: progress ? progress.index + 1 : 1,
        count: progress ? progress.count : models.length,
        percent,
        received: formatBytes(progress && progress.received),
        total: formatBytes(progress && progress.total),
      });
      const [heading, ...details] = message.split('\n');
      dispatch(openAlertDialog(messageWithDetails(heading, details), true, translate('buttons.cancel_button'), onCancel));
    };

    showProgress(null);

    try {
      const { errors = [] } = await modelsApi.download(models, showProgress);

      if (cancelled) {
        return;
      }

      if (errors.length) {
        const details = errors.map(error => `${error.name}: ${error.message}`);
        dispatch(openAlertDialog(messageWithDetails(translate('updates.models_unsuccessful_download'), details)));
      } else {
        dispatch(openAlertDialog(translate('updates.models_successful_download')));
      }
    } catch (e) {
      console.error('downloadModelUpdates() - error:', e);

      if (!cancelled) {
        dispatch(openAlertDialog(messageWithDetails(
          translate('updates.models_unsuccessful_download'), [String(e && e.message || e)],
        )));
      }
    }
  };
}
