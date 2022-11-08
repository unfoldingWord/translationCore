/* eslint-disable no-console */

import React from 'react';
// import { getTranslate } from '../selectors';
import { getUsfm2ExportFile } from '../actions/USFMExportActions';
import PreviewContent from '../components/PreviewContent';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as LoadHelpers from './LoadHelpers';

export function doPrintPreview(projectPath) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    let usfm;
    let alertMessage;

    try {
      const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
      const languageId = manifest?.target_language?.id || '';
      const bookId = manifest?.project?.id || '';
      const typeName = manifest?.project?.name || '';
      usfm = getUsfm2ExportFile(projectPath);
      alertMessage = <PreviewContent
        bookId={bookId}
        usfm={usfm}
        languageId={languageId}
        typeName={typeName}
        printImmediately={true}
        onRefresh={() => {
        }}
        onError={(errors) => {
          console.warn(`Error rendering bible`, errors);
          const message = `Error rendering usfm from ${projectPath}!`;
          dispatch(AlertModalActions.openAlertDialog(message, false));
        }}
      />;
    } catch (e) {
      console.warn(`doPrintPreview(${projectPath}) - error getting usfm`, e);
      const message = `Error getting usfm from ${projectPath}!`;
      dispatch(AlertModalActions.openAlertDialog(message, false));
    }

    if (alertMessage) {
      dispatch(AlertModalActions.openOptionDialog(
        alertMessage,
        (res) => {
          if (res === 'OK') {
            resolve();
          } else {
            //used to cancel the entire process
            reject();
          }
          dispatch(AlertModalActions.closeAlertDialog());
        }, 'Print', 'Cancel'));
    }
  }));
}
