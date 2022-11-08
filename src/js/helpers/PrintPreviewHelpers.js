/* eslint-disable no-console */

import React from 'react';
import { getTranslate } from '../selectors';
import { getUsfm2ExportFile } from '../actions/USFMExportActions';
import PreviewContent from '../components/PreviewContent';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as LoadHelpers from './LoadHelpers';

export function doPrintPreview(projectPath) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    const PRINT_BUTTON = 'Print';
    let usfm;
    let alertMessage;
    const translate = getTranslate(getState());

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
        translate={translate}
        onRefresh={(html) => {
          console.log(`doPrintPreview() - Finished rendering to html: ${html}`); // TODO - limit text length
        }}
        onError={(errors) => {
          console.warn(`doPrintPreview() - Error rendering bible`, errors);
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
          if (res === PRINT_BUTTON) {
            console.log(`doPrintPreview(${projectPath}) - selected print`);
            resolve();
          } else {
            console.log(`doPrintPreview(${projectPath}) - close`);
            reject();
          }
          dispatch(AlertModalActions.closeAlertDialog());
        }, PRINT_BUTTON, translate('button.close_button')));
    }
  }));
}
