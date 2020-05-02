/* eslint-disable no-async-promise-executor */
import fs from 'fs-extra';
import path from 'path-extra';
import { ipcRenderer } from 'electronite';
import env from 'tc-electron-env';
import { BIBLES_ABBRV_INDEX } from '../common/BooksOfTheBible';
import { delay } from '../common/utils';
import { OSX_DOCUMENTS_PATH, WIN_DOCUMENTS_PATH } from '../common/constants';
// helpers
import * as manifestHelpers from './manifestHelpers';
import * as bibleHelpers from './bibleHelpers';
import * as LoadHelpers from './LoadHelpers';
import * as FileConversionHelpers from './FileConversionHelpers';

/**
 * Prompts the user to enter a location/name to save the usfm project.
 * Returns the path to save.
 * @param {string} projectName - Name of the project being exported (This can be altered by the user
 * when saving)
 * @param {string} lastSaveLocation - The last save location from the user. Coming from the settings reducer.
 * @param {string} ext - The extension to export the file with
 */
export function getFilePath(projectName, lastSaveLocation, ext) {
  return new Promise(async (resolve, reject) => {
    await delay(100);
    // Path where to save the usfm file
    let defaultPath;

    if (lastSaveLocation) {
      defaultPath = path.join(lastSaveLocation, projectName + `.${ext}`);
    } else if (fs.existsSync(OSX_DOCUMENTS_PATH)) {
      defaultPath = path.join(OSX_DOCUMENTS_PATH, projectName + `.${ext}`);
    } else if (fs.existsSync(WIN_DOCUMENTS_PATH)) {
      defaultPath = path.join(WIN_DOCUMENTS_PATH, projectName + `.${ext}`);
    } else {
      defaultPath = path.join(env.home(), projectName + `.${ext}`);
    }

    const filePath = ipcRenderer.sendSync('save-as', {
      options: {
        defaultPath: defaultPath, filters: [{ extensions: [ext] }], title: 'Save Export As',
      },
    });

    if (filePath) {
      resolve(filePath);
    } else {
      reject();
    }
  });
}

/**
 * add entry to headers with optional overwrite
 * @param {array} headers
 * @param {object} add - verseObject type to add
 * @param {boolean} overWrite - if true then we replace existing entry
 */
let addHeader = function (headers, add, overWrite) {
  const index = headers.findIndex(item => (item.tag === add.tag));

  if (index >= 0) {
    if (overWrite) {
      headers[index] = add;
    }
  } else {
    headers.push(add);
  }
};

/**
 * This function uses the manifest to populate the usfm JSON object id key in preparation
 * of usfm to JSON conversion
 * @param {string} projectSaveLocation - Path location in the filesystem for the project.
 */
export function getHeaderTags(projectSaveLocation) {
  const manifest = manifestHelpers.getProjectManifest(projectSaveLocation);
  const bookName = manifest.project.id;

  /**Has fields such as "language_id": "en" and "resource_id": "ult" and
   * "direction":"ltr" manifest.resource is for target id which is
   * "Translation Id" and name which contains "nickname" */
  let sourceTranslation = manifest.source_translations[0];
  let targetResource = manifest.resource;
  let resourceName = sourceTranslation && sourceTranslation.language_id &&
      targetResource.id ?
    `${sourceTranslation.language_id.toUpperCase()}_${targetResource.id.toUpperCase()}` :
    'N/A';

  /**This will look like: EN_ULB sw_Kiswahili_ltr to be included in the usfm id.
   * This will make it easier to read for tC later on */
  let targetLanguageCode = manifest.target_language ?
    `${manifest.target_language.id}_${manifest.target_language.name
      .split(' ')
      .join('⋅')}_${manifest.target_language.direction}` :
    'N/A';

  /**Date object when project was last changed in FS */
  let lastEdited = fs.statSync(path.join(projectSaveLocation), bookName).atime;
  let bookNameUppercase = bookName.toUpperCase();
  let headers = LoadHelpers.loadFile(path.join(projectSaveLocation, bookName),
    'headers.json');
  headers = headers || [];
  const idHeaderTag = headers.find(({ tag }) => tag === 'id');
  let preservedIDTag = idHeaderTag && idHeaderTag.content ? idHeaderTag.content : '';
  let tcField = preservedIDTag.substr(preservedIDTag.length - 2, preservedIDTag.length - 1);

  if (tcField === 'tc') {
    //If the usfm id header has already been created with the tc
    //flag then the original preserved contnet has already bee included
    preservedIDTag = '';
  } else if (preservedIDTag) {
    preservedIDTag = ' ' + preservedIDTag.replace(new RegExp(bookNameUppercase, 'i'), '').trim();
  }

  /**Note the indication here of tc on the end of the id. This will act as a flag to ensure the correct parsing*/
  const id = {
    'content': `${bookNameUppercase} ${resourceName} ${targetLanguageCode}${preservedIDTag} ${lastEdited} tc`,
    'tag': 'id',
  };
  addHeader(headers, id, true);
  const h = {
    'content': bibleHelpers.convertToFullBookName(bookName),
    'tag': 'h',
  };
  addHeader(headers, h, false);
  return headers;
}

/**
 * Gets the project name for USFM export based on the
 * door43 standards.
 *
 * @param {object} manifest
 * @returns {string}
 */
export function getUsfmExportName(manifest) {
  if (manifest && manifest.project && manifest.project.id) {
    const bookAbbrv = manifest.project.id;
    const index = BIBLES_ABBRV_INDEX[bookAbbrv];
    return `${index}-${bookAbbrv.toUpperCase()}`;
  }
}

/**
 * reads the header.json for project
 * @param {String} projectSaveLocation
 * @param {String} bookName
 * @return {Object}
 */
export function getProjectHeaderData(projectSaveLocation, bookName) {
  return LoadHelpers.loadFile(path.join(projectSaveLocation, bookName), 'headers.json');
}

/**
 * saves the header.json for project
 * @param {String} projectSaveLocation
 * @param {String} bookName
 * @param {Array} headers
 */
export function saveProjectHeaderData(projectSaveLocation, bookName, headers) {
  fs.ensureDirSync(path.join(projectSaveLocation, bookName));
  fs.outputJsonSync(path.join(projectSaveLocation, bookName, 'headers.json'),
    headers);
}

/**
 * search for specific tag in header
 * @param {Array} headers
 * @param {String} matchTag - to match
 * @return {*}
 */
export function findUsfmTagInHeader(headers, matchTag) {
  const matchedHeader = headers.find(({ tag }) => tag === matchTag);
  return matchedHeader;
}

/**
 * search for specific tag in header
 * @param {String} projectSaveLocation
 * @param {object} manifest
 */
export function makeSureUsfm3InHeader(projectSaveLocation, manifest) {
  let folderForHeader = projectSaveLocation;

  try {
    const bookAbbrv = manifest && manifest.project && manifest.project.id;
    folderForHeader = path.join(projectSaveLocation, bookAbbrv);
    const headers = getProjectHeaderData(projectSaveLocation, bookAbbrv);

    if (!headers) {
      console.log('Empty Project Header at \'' + folderForHeader);
    }

    let updateHeader = true;
    const matchedHeader = findUsfmTagInHeader(headers, 'usfm');

    if (matchedHeader) {
      if (matchedHeader.content !== '3.0') {
        matchedHeader.content = '3.0';
      } else {
        updateHeader = false;
      }
    } else {
      const usfmTag = { tag: 'usfm', content: '3.0' };

      if (headers.length < 2) {
        headers.push(usfmTag);
      } else {
        headers.splice(1, 0, usfmTag);
      }
    }

    if (updateHeader) {
      saveProjectHeaderData(projectSaveLocation, bookAbbrv, headers);
    }
  } catch (e) {
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(e, 'Error updating Project Header');
    console.error('Error updating Project Header at \'' + folderForHeader + '\' ' + errorMessage);
  }
}
