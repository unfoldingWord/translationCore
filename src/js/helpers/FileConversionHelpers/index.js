import React from 'react';
import path from 'path-extra';
// helpers
import * as UsfmFileConversionHelpers from './UsfmFileConversionHelpers';
import * as ZipFileConversionHelpers from './ZipFileConversionHelpers';

export const convert = (sourceProjectPath, selectedProjectFilename) => {
  return new Promise (async(resolve, reject) => {
    try {
      if(projectHasUsfmFileExtension(sourceProjectPath)) {
        await UsfmFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
      } else if (projectHasTstudioOrTcoreFileExtension(sourceProjectPath)) {
        // project's extension name is either .tstudio or .tcore
        await ZipFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
      } else {
        reject(
          <div>
            The project you selected ({sourceProjectPath}) is an invalid tstudio or tcore project. <br />
            Please verify the project you selected is a valid  tstudio or tcore file.
          </div>
        );
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const projectHasUsfmFileExtension = (sourceProjectPath) => {
  const projectExtensionName = path.extname(sourceProjectPath).toLowerCase();
  const usfm = ['.usfm', '.sfm', '.txt'];

  return usfm.includes(projectExtensionName);
};

export const projectHasTstudioOrTcoreFileExtension = (sourceProjectPath) => {
  const projectExtensionName = path.extname(sourceProjectPath).toLowerCase();
  const validFileExtensions = ['.tstudio', '.tcore'];

  return validFileExtensions.includes(projectExtensionName);
};

/**
 * logs error and converts to safe
 * @param {Object|String} error
 * @param {String} defaultErrorMessage - message to return if error is undefined or JavaScript error
 * @return {String} safe displayable message
 */
export const getSafeErrorMessage = (error, defaultErrorMessage) => {
  let errorMessage = error || defaultErrorMessage;
  if (error && (error.type !== 'div')) {
    if (error.stack) {
      console.warn(error.stack); // log error before replacing with translated message
      errorMessage = defaultErrorMessage;
    } else {
      console.warn(error.toString()); // make message printable
    }
  }
  return errorMessage;
};

