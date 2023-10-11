/* eslint-disable no-console,object-curly-newline */

import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import { getTranslate } from '../selectors';
import { getUsfm2ExportFile } from '../actions/USFMExportActions';
import PreviewContent from '../components/PreviewContent';
import * as AlertModalActions from '../actions/AlertModalActions';
import { delay } from '../common/utils';
import { USER_HOME } from '../common/constants';
import * as LoadHelpers from './LoadHelpers';
import * as exportHelpers from './exportHelpers';

/**
 * get the project in USFM format and clean up for proskomma
 * @param {string} projectPath
 * @returns {*}
 */
function getUSfmFromProjectPath(projectPath) {
  let usfm = getUsfm2ExportFile(projectPath);

  // make sure we have a paragraph marker before first verse
  const pos = usfm.indexOf('\\v');

  if (pos >= 0) {
    const initialText = usfm.substring(0, pos);
    const ppos = initialText.indexOf('\\p');

    if (ppos < 0) { // if missing initial paragraph marker before first verse, insert
      const usfm_ = usfm.replace('\\v', '\\p\n\\v');
      usfm = usfm_;
    }
  }
  return usfm;
}

export function doPrintPreview(projectPath) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    let usfm;
    let alertMessage;
    let html;
    const translate = getTranslate(getState());
    const projectName = path.basename(projectPath);
    let previewWindow = null;
    const PRINT_BUTTON = translate('buttons.print_to_pdf');

    try {
      dispatch(AlertModalActions.openAlertDialog('Rendering', true));
      const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
      const languageId = manifest?.target_language?.id || '';
      const bookId = manifest?.project?.id || '';
      const typeName = manifest?.project?.name || '';
      const projectFont = manifest?.projectFont || '';
      usfm = getUSfmFromProjectPath(projectPath);
      alertMessage = <PreviewContent
        bookId={bookId}
        usfm={usfm}
        languageId={languageId}
        typeName={typeName}
        printImmediately={true}
        translate={translate}
        projectFont={projectFont}
        onRefresh={(html_) => {
          console.log(`doPrintPreview() - Finished rendering to html: ${html_ && html_.substring(0, 200)}`); // TODO - limit text length
          html = html_;

          if (html) {
            if (previewWindow) {
              console.log(`doPrintPreview() - window already open, close before recreating`);
              previewWindow.close();
              previewWindow = null;
            }
            previewWindow = showPreview(html, () => {
              previewWindow = null;
            });
          }
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
      const CLOSE_BUTTON = translate('buttons.close_button');

      dispatch(AlertModalActions.openOptionDialog(
        alertMessage,
        (res) => {
          if (res === PRINT_BUTTON) {
            console.log(`doPrintPreview(${projectPath}) - selected print`);

            if (html) {
              doPrint(previewWindow, html, projectName, () => {
                dispatch(AlertModalActions.closeAlertDialog());
                console.log(`doPrintPreview(${projectPath}) - print finished`);
              });
            } else {
              previewWindow && previewWindow.close();
              dispatch(AlertModalActions.closeAlertDialog());
              console.error(`doPrintPreview(${projectPath}) - no html to print`);
            }
          } else {
            previewWindow && previewWindow.close();
            dispatch(AlertModalActions.closeAlertDialog());
            console.log(`doPrintPreview(${projectPath}) - close`);
          }
        },
        PRINT_BUTTON,
        CLOSE_BUTTON,
      ));
    }
  }));
}

/**
 * create a preview window and show html
 * @param {string} html
 * @returns {*} window
 */
function createPreviewWindow(html) {
  const { BrowserWindow } = require('@electron/remote');
  const win = new BrowserWindow({
    width: 850,
    height: 900,
    webPreferences: {
      webSecurity: false, // have to do this to load local files
    },
  });
  const loadData = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  win.loadURL(loadData);
  return win;
}

/**
 * show preview window with html
 * @param html - to display
 * @param onClose
 */
function showPreview(html, onClose) {
  const win = createPreviewWindow(html);

  win.webContents.on('did-finish-load', () => {
    console.log('showPreview() - loaded');
  });

  win.webContents.on('destroyed', () => {
    console.log('showPreview() - destroyed');
    onClose && onClose();
  });

  return win;
}

/**
 * prints the contents of the window
 * @param window
 * @param projectName
 * @param DOWNLOADS_PATH
 * @param onFinished
 * @param pdfPath
 */
function printWindowContents(window, projectName, DOWNLOADS_PATH, onFinished, pdfPath) {
  window.webContents.printToPDF({}).then(data => {
    console.log('doPrint() - have PDF');

    exportHelpers.getFilePath(projectName, DOWNLOADS_PATH, 'pdf').then(pdfPath => {
      console.log(`doPrint() - have PDF save path: ${pdfPath}`);

      fs.writeFile(pdfPath, data, (error) => {
        if (error) {
          console.error(`doPrint() - printToPDF error`, error);
        } else {
          console.log(`Wrote PDF successfully to ${pdfPath}`);
        }
        window.close();
        onFinished && onFinished();
      });
    }).catch(error => {
      console.log(`Failed to select PDF path: `, error);
    });
  }).catch(error => {
    console.log(`Failed to write PDF to ${pdfPath}: `, error);
    onFinished && onFinished();
  });
}

/**
 * print preview window. If not open then open showing html
 * @param previewWindow
 * @param {string} html - to display
 * @param {string} projectName
 * @param {function} onFinished
 */
function doPrint(previewWindow, html, projectName, onFinished) {
  console.log('doPrint() - doing print');
  const DOWNLOADS_PATH = path.join(USER_HOME, 'Downloads');

  if (previewWindow) {
    console.log('doPrint() - using preview window');
    printWindowContents(previewWindow, projectName, DOWNLOADS_PATH, onFinished);
  } else {
    const win = createPreviewWindow(html);

    win.webContents.on('did-finish-load', () => {
      console.log('doPrint() - loaded');
      delay(500).then(() => printWindowContents(win, projectName, DOWNLOADS_PATH, onFinished));
    });
    win.webContents.on('did-load-fail', () => {
      console.log('doPrint() - load failed');
    });
  }
}
