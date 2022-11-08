/* eslint-disable no-console */

import React from 'react';
// import { getTranslate } from '../selectors';
import { getUsfm2ExportFile } from '../actions/USFMExportActions';
import PreviewContent from '../components/PreviewContent';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as LoadHelpers from './LoadHelpers';

export function doPrintPreview(projectPath) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    const languageId = manifest?.target_language?.id || '';
    const bookId = manifest?.project?.id || '';
    const typeName = manifest?.project?.name || '';
    const usfm = getUsfm2ExportFile(projectPath);

    dispatch(AlertModalActions.openOptionDialog(
      <PreviewContent
        bookId={bookId}
        usfm={usfm}
        languageId={languageId}
        typeName={typeName}
        active={true}
        onRefresh={() => {}}
        onAction={() => {}}
      />,
      (res) => {
        if (res === 'OK') {
          resolve();
        } else {
          //used to cancel the entire process
          reject();
        }
        dispatch(AlertModalActions.closeAlertDialog());
      }, 'OK', 'Cancel'));
  }));
}
