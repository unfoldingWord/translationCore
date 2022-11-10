/* eslint-disable no-console,object-curly-newline */

import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import env from 'tc-electron-env';
import { BrowserWindow } from '@electron/remote';
import { getTranslate } from '../selectors';
import { getUsfm2ExportFile } from '../actions/USFMExportActions';
import PreviewContent from '../components/PreviewContent';
import * as AlertModalActions from '../actions/AlertModalActions';
import * as LoadHelpers from './LoadHelpers';
import * as exportHelpers from './exportHelpers';

export function doPrintPreview(projectPath) {
  return ((dispatch, getState) => new Promise((resolve, reject) => {
    const PRINT_BUTTON = 'Print';
    let usfm;
    let alertMessage;
    let html;
    const translate = getTranslate(getState());
    const projectName = path.basename(projectPath);
    let previewWindow = null;

    try {
      dispatch(AlertModalActions.openAlertDialog('Rendering', true));
      const manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
      const languageId = manifest?.target_language?.id || '';
      const bookId = manifest?.project?.id || '';
      const typeName = manifest?.project?.name || '';
      const projectFont = manifest?.projectFont || '';
      usfm = getUsfm2ExportFile(projectPath);
      alertMessage = <PreviewContent
        bookId={bookId}
        usfm={usfm}
        languageId={languageId}
        typeName={typeName}
        printImmediately={true}
        projectFont={projectFont}
        onRefresh={(html_) => {
          console.log(`doPrintPreview() - Finished rendering to html: ${html_ && html_.substring(0, 200)}`); // TODO - limit text length
          html = html_;

          if (html) {
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
  const DOWNLOADS_PATH = path.join(env.home(), 'Downloads');

  if (previewWindow) {
    console.log('doPrint() - using preview window');
    printWindowContents(previewWindow, projectName, DOWNLOADS_PATH, onFinished);
  } else {
    const win = createPreviewWindow(html);

    win.webContents.on('did-finish-load', () => {
      console.log('doPrint() - loaded');
      printWindowContents(win, projectName, DOWNLOADS_PATH, onFinished);
    });
    win.webContents.on('did-load-fail', () => {
      console.log('doPrint() - load failed');
    });
  }
}
