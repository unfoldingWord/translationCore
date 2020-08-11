/* eslint-disable no-async-promise-executor */
import React from 'react';
import path from 'path-extra';
import { renderToString } from 'react-dom/server';
// helpers
import * as REPO from '../../helpers/Repo.js';
import * as UsfmFileConversionHelpers from './UsfmFileConversionHelpers';
import * as ZipFileConversionHelpers from './ZipFileConversionHelpers';

/**
 * convert project to tCore format, resolve returns object identifying import type
 * @param sourceProjectPath
 * @param selectedProjectFilename
 * @return {Promise<any>}
 */
export const convert = (sourceProjectPath, selectedProjectFilename) => new Promise (async (resolve, reject) => {
  try {
    const projectInfo = {};

    if (projectHasUsfmFileExtension(sourceProjectPath)) {
      projectInfo.usfmProject = true;
      await UsfmFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
    } else if (projectHasTstudioOrTcoreFileExtension(sourceProjectPath)) {
      projectInfo.usfmProject = false;
      // project's extension name is either .tstudio or .tcore
      await ZipFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
    } else {
      reject(
        <div>
            The project you selected ({sourceProjectPath}) is an invalid tstudio or tcore project. <br />
            Please verify the project you selected is a valid  tstudio or tcore file.
        </div>,
      );
    }
    resolve(projectInfo);
  } catch (error) {
    reject(error);
  }
});

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
 * logs error and converts to safe displayable message
 * @param {Object|String} error
 * @param {String} defaultErrorMessage - message to return if error is undefined or JavaScript error
 * @return {String} safe displayable message
 */
export const getSafeErrorMessage = (error, defaultErrorMessage) => {
  let errorMessage = error || defaultErrorMessage;

  if (error) {
    console.warn('getSafeErrorMessage()', error); // log error as string

    if ((error.type !== 'div') && (error.type !== 'span')) {
      if (error.stack) {
        console.warn('getSafeErrorMessage()', error.stack); // log error stack before replacing with translated message
        errorMessage = defaultErrorMessage;
      } else {
        console.warn('getSafeErrorMessage()', error.toString()); // log error as string
      }
    } else {
      console.warn('getSafeErrorMessage()', renderToString(error)); // log react message as string
    }
  }
  return errorMessage;
};

/**
 * convert git error message to localized message and determine if known or unknown
 * @param {String|Object} error
 * @param {Function} translate
 * @param {String} projectName
 * @return {{isUnknown: boolean, message: string}}
 */
export function getLocalizedErrorMessage(error, translate, projectName) {
  let message = 'unknown';
  let isUnknown = true;

  if (error.status === 401) {
    message = translate('users.session_invalid');
    isUnknown = false;
  } else {
    const errorStr = error.toString();

    if (errorStr.includes(REPO.GIT_ERROR_REPO_ARCHIVED)) {
      message = translate('projects.archived',
        {
          project_name: projectName,
          door43: translate('_.door43'),
          app_name: translate('_.app_name'),
        });
      isUnknown = false;
    } else if (error.code === REPO.NETWORK_ERROR_IP_ADDR_NOT_FOUND ||
      errorStr.includes(REPO.GIT_ERROR_UNABLE_TO_CONNECT) ||
      errorStr.includes(REPO.NETWORK_ERROR_TIMEOUT) ||
      errorStr.includes(REPO.NETWORK_ERROR_INTERNET_DISCONNECTED) ||
      errorStr.includes(REPO.NETWORK_ERROR_UNABLE_TO_ACCESS) ||
      errorStr.includes(REPO.NETWORK_ERROR_REMOTE_HUNG_UP)) {
      message = translate('no_internet');
      isUnknown = false;
    } else if (errorStr.includes(REPO.GIT_ERROR_PUSH_NOT_FF)) {
      message = translate('projects.upload_modified_error',
        { project_name: projectName, door43: translate('_.door43') });
      isUnknown = false;
    } else if (errorStr.includes(REPO.GIT_ERROR_UNKNOWN_PROBLEM)) {
      const parts = errorStr.split(REPO.GIT_ERROR_UNKNOWN_PROBLEM);
      let details = parts.length > 1 ? parts[1] : errorStr;

      if (details[0] === ':') {
        details = details.substr(1).trim();
      }
      console.error(`Unknown GIT error: ${details}`);
    } else if (error.hasOwnProperty('message')) {
      console.error(`Unknown error: ${error.message}`);
    } else if (error.hasOwnProperty('data') && error.data) {
      console.error(`Unknown upload error: ${error.data}`);
    } else { // unknown error
      console.error('Unknown error:', errorStr || error);
    }
  }
  return { message, isUnknown };
}
