/* eslint-disable no-console */

import fs from 'fs-extra';
import usfmjs from 'usfm-js';
import path from 'path-extra';
// constants
const IMPORTED_SOURCE_PATH = '.apps/translationCore/importedSource';

/**
 * @description saves a target language bible data into the filesystem as json and divided into chapters,
 *                    assumes tS project
 * @param {string} projectPath - path where the project is located in the filesystem.
 * @param {object} manifest
 * @param {object} bookData - data to save
 * @param {object|String} headers - header data to save
 */
export function saveTargetBible(projectPath, manifest, bookData, headers) {
  let bookAbbreviation = manifest.project.id;
  const targetBiblePath = path.join(projectPath, bookAbbreviation);

  // now that bookData is populated or passed in, let's save it to the fs as chapter level json files
  for (let chapter in bookData) {
    if (!parseInt(chapter)) {
      continue;
    } // only import integer based data, there are other files

    let fileName = chapter + '.json';
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    fs.outputJsonSync(path.join(targetBiblePath, fileName), bookData[chapter], { spaces: 2 });
  }
  saveHeaders(targetBiblePath, headers);
  // Move bible source files from project's root folder to '.apps/translationCore/importedSource'
  archiveSourceFiles(projectPath, bookAbbreviation);
}

/**
 * write headers to headers.json removing some duplicated tags
 * @param targetBiblePath
 * @param headers
 */
function saveHeaders(targetBiblePath, headers) {
  if (headers) {
    if (typeof headers === 'string') {
      const json = usfmjs.toJSON(headers);
      headers = json.headers;
    }

    if (headers) {
      fs.outputJsonSync(path.join(targetBiblePath, 'headers.json'), headers, { spaces: 2 });
    }
  }
}

/**
 * @description helper function that Moves bible source files from project's root folder to '.apps/translationCore/importedSource'.
 * @param {string} projectPath - project save location / path.
 * @param {string} bookAbbreviation - the directory name of the book so we don't move it
 */
function archiveSourceFiles(projectPath, bookAbbreviation) {
  // get all of the directories/files in the projectPath
  fs.readdirSync(projectPath)
    .forEach(file => {
      // check for conditions in which we need to archive
      const isDirectory = fs.lstatSync(path.join(projectPath, file)).isDirectory();
      const isBookAbbreviation = file === bookAbbreviation;
      const isDotFile = !!file.match(/^\./);
      const isUSFM = !!file.toLowerCase().match('.usfm') || !!file.toLowerCase().match('.sfm');
      // build the condition to move
      const shouldMove = isUSFM || (isDirectory && !isBookAbbreviation && !isDotFile);

      if (shouldMove) {
        const directory = file;
        const sourcePath = path.join(projectPath, directory);

        // try to move the directories and log the errors
        try {
          let targetPath = path.join(projectPath, IMPORTED_SOURCE_PATH, directory);

          if (!fs.existsSync(targetPath)) {
            fs.moveSync(sourcePath, targetPath);
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
}
