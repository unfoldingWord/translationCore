'use strict';

/**
 * This was taken from https://github.com/peakon/crowdin-api
 * with some fixes added by Joel Lonbeck <joel@neutrinographics.com>
 *
 * This requires node 7 or higher.
 */

const fs = require('fs-extra');
const request = require('request');
const requestPromise = require('request-promise');
const temp = require('temp');
const Bluebird = require('bluebird');
const _ = require('lodash');

temp.track();

function resultToError(result) {
  return new Error('Error code ' + result.error.code + ': ' + result.error.message);
}

function parseError(err) {
  if (err.response && err.response.body) {
    try {
      const parsed = JSON.parse(err.response.body);
      return resultToError(parsed);
    } catch (parseErr) {
      // Return original error instead
      return err;
    }
  }

  return err;
}

function handlePromise(request) {
  return request.then(response => {
    const result = JSON.parse(response);
    if (result.success === false) {
      return Promise.reject(resultToError(result));
    } else {
      return Promise.resolve(result);
    }
  }).catch(error => {
    return Promise.reject(parseError(error));
  });
}

function handleStream(request) {
  // TODO: we need convert _handleStream below to just use promises and not async/await for backwards compatability
  return Promise.reject('Not implemented');
}

// async function _handleStream(request) {
//   const {path, fd} = await Bluebird.fromCallback(cb => {
//     temp.open('crowdin', cb);
//   });
//
//   const out = fs.createWriteStream(null, {
//     fd
//   });
//
//   return new Bluebird((resolve, reject) => {
//     let statusCode;
//
//     request
//       .on('error', err => {
//         return reject(parseError(err));
//       })
//       .on('response', response => {
//         statusCode = response.statusCode;
//       })
//       .pipe(out);
//
//     out.on('close', async () => {
//       if (statusCode < 400) {
//         return resolve(path);
//       } else {
//         try {
//           let body = await Bluebird.fromCallback(cb => fs.readFile(path, {
//             encoding: 'utf8'
//           }, cb));
//
//           try {
//             const result = JSON.parse(body);
//
//             return reject(resultToError(result));
//           } catch (err) {
//             console.log('Error parsing body', err);
//             console.log(body);
//           }
//         } catch (err) {
//           console.log('Error reading body file', err);
//         }
//
//         return reject(`Error streaming from Crowdin: ${statusCode}`);
//       }
//     });
//   });
// }

class CrowdinApi {
  constructor({baseUrl = 'https://api.crowdin.com', apiKey}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    if (!apiKey) {
      throw new Error('Please specify CrowdIn API key.');
    }
  }

  uri(path) {
    return `${this.baseUrl}/api/${path}`;
  }

  getPromise(path) {
    return handlePromise(requestPromise.get({
      uri: this.uri(path),
      qs: {
        json: true,
        key: this.apiKey
      }
    }));
  }

  postPromise(path, qs = {}, data) {
    Object.assign(qs, {
      json: true,
      key: this.apiKey
    });

    return handlePromise(requestPromise.post({
      uri: this.uri(path),
      qs,
      formData: data
    }));
  }

  getStream(path) {
    return handleStream(request.get({
      uri: this.uri(path),
      qs: {
        json: true,
        key: this.apiKey
      }
    }));
  }

  /**
   * Add new file to Crowdin project
   * @param projectName {String} Should contain the project identifier
   * @param files {Array} Files array that should be added to Crowdin project.
   *   Array keys should contain file names with path in Crowdin project.
   *   Note! 20 files max are allowed to upload per one time file transfer.
   * @param params {Object} Information about uploaded files.
   */
  addFile(projectName, files, params) {
    let filesInformation = _.mapKeys(files, (filePath, fileName) => {
      return `files[${fileName}]`;
    });
    filesInformation = _.mapValues(filesInformation, filePath => {
      return fs.createReadStream(filePath);
    });

    return this.postPromise(`project/${projectName}/add-file`, undefined, Object.assign(filesInformation, params));
  }

  /**
   * Upload latest version of your localization file to Crowdin.
   * @param projectName {String} Should contain the project identifier
   * @param files {Object} A dictionary of files to upload. The key should be it's path on Crowdin.
   *   Note! 20 files max are allowed to upload per one time file transfer.
   * @param params {Object} Information about updated files.
   */
  updateFile(projectName, files, params) {
    let filesInformation = _.mapKeys(files, (filePath, fileName) => {
      return `files[${fileName}]`;
    });
    filesInformation = _.mapValues(filesInformation, filePath => {
      return fs.createReadStream(filePath);
    });
    return this.postPromise(`project/${projectName}/update-file`, undefined, Object.assign(filesInformation, params));
  }

  /**
   * Delete file from Crowdin project. All the translations will be lost without ability to restore them.
   * @param projectName {String} Should contain the project identifier
   * @param fileName {String} Name of file to delete.
   */
  deleteFile(projectName, fileName) {
    return this.postPromise(`project/${projectName}/delete-file`, undefined, {
      file: fileName
    });
  }

  /**
   * Upload existing translations to your Crowdin project
   * @param projectName {String} Should contain the project identifier
   * @param files {Array} Translated files array. Array keys should contain file names in Crowdin.
   *   Note! 20 files max are allowed to upload per one time file transfer.
   * @param language {String} Target language. With a single call it's possible to upload translations for several files but only into one of the languages
   * @param params {Object} Information about updated files.
   */
  updateTranslations(projectName, files, language, params) {
    const filesInformation = _.fromPairs(files, fileName => {
      return [`files[${fileName}]`, fs.createReadStream(fileName)];
    });

    return this.postPromise(`project/${projectName}/upload-translation`, undefined, Object.assign(filesInformation, params));
  }

  /**
   * Track your Crowdin project translation progress by language.
   * @param projectName {String} Should contain the project identifier.  */
  translationStatus(projectName) {
    return this.postPromise(`project/${projectName}/status`);
  }

  /**
   * Get Crowdin Project details.
   * @param projectName {String} Should contain the project identifier.
   */
  projectInfo(projectName) {
    return this.postPromise(`project/${projectName}/info`);
  }

  /**
   * Download ZIP file with translations. You can choose the language of translation you need.
   */
  downloadTranslations(projectName, languageCode) {
    return this.getStream(`project/${projectName}/download/${languageCode}.zip`);
  }

  /**
   * Download ZIP file with all translations.
   */
  downloadAllTranslations(projectName) {
    return this.getStream(`project/${projectName}/download/all.zip`);
  }

  /**
   * Build ZIP archive with the latest translations. Please note that this method can be invoked only once per 30 minutes (there is no such
   * restriction for organization plans). Also API call will be ignored if there were no changes in the project since previous export.
   * You can see whether ZIP archive with latest translations was actually build by status attribute ('built' or 'skipped') returned in response.
   */
  exportTranslations(projectName) {
    return this.getPromise(`project/${projectName}/export`);
  }

  /**
   * Edit Crowdin project
   * @param projectName {String} Name of the project to change
   * @param params {Object} New parameters for the project.
   */
  editProject(projectName, params) {
    return this.postPromise(`project/${projectName}/edit-project`, undefined, params);
  }

  /**
   * Delete Crowdin project with all translations.
   * @param projectName {String} Name of the project to delete.
   */
  deleteProject(projectName) {
    return this.postPromise(`project/${projectName}/delete-project`);
  }

  /**
   * Add directory to Crowdin project.
   * @param projectName {String} Should contain the project identifier.
   * @param directory {String} Directory name (with path if nested directory should be created).
   */
  createDirectory(projectName, directory) {
    return this.postPromise(`project/${projectName}/add-directory`, undefined, {
      name: directory
    });
  }

  /**
   * Rename directory or modify its attributes. When renaming directory the path can not be changed (it means new_name parameter can not contain path, name only).
   * @param projectName {String} Full directory path that should be modified (e.g. /MainPage/AboutUs).
   * @param directory {String} New directory name.
   * @param params {Object} New parameters for the directory.
   */
  changeDirectory(projectName, directory, params) {
    return this.postPromise(`project/${projectName}/change-directory`, undefined, {
      name: directory
    }, params);
  }

  /**
   * Delete Crowdin project directory. All nested files and directories will be deleted too.
   * @param projectName {String} Should contain the project identifier.
   * @param directory {String} Directory path (or just name if the directory is in root).
   */
  deleteDirectory(projectName, directory) {
    return this.postPromise(`project/${projectName}/delete-directory`, undefined, {
      name: directory
    });
  }

  /**
   * Download Crowdin project glossaries as TBX file.
   */
  downloadGlossary(projectName) {
    return this.getStream(`project/${projectName}/download-glossary`);
  }

  /**
   * Upload your glossaries for Crowdin Project in TBX file format.
   * @param projectName {String} Should contain the project identifier.
   * @param fileNameOrStream {String} Name of the file to upload or stream which contains file to upload.
   */
  uploadGlossary(projectName, fileNameOrStream) {
    if (typeof fileNameOrStream === 'string') {
      fileNameOrStream = fs.createReadStream(fileNameOrStream);
    }

    return this.postPromise(`project/${projectName}/upload-glossary`, undefined, {
      file: fileNameOrStream
    });
  }

  /**
   * Download Crowdin project Translation Memory as TMX file.
   */
  downloadTranslationMemory(projectName) {
    return this.postPromise(`project/${projectName}/download-tm`);
  }

  /**
   * Upload your Translation Memory for Crowdin Project in TMX file format.
   * @param projectName {String} Should contain the project identifier.
   * @param fileNameOrStream {String} Name of the file to upload or stream which contains file to upload.
   */
  uploadTranslationMemory(projectName, fileNameOrStream) {
    if (typeof fileNameOrStream === 'string') {
      fileNameOrStream = fs.createReadStream(fileNameOrStream);
    }

    return this.postPromise(`project/${projectName}/upload-tm`, undefined, {
      file: fileNameOrStream
    });
  }

  /**
   * Get supported languages list with Crowdin codes mapped to locale name and standardized codes.
   */
  supportedLanguages() {
    return this.getPromise('supported-languages');
  }
}

module.exports = CrowdinApi;
