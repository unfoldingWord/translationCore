/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// helpers
import * as BibleHelpers from './bibleHelpers';
// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');
const STATIC_RESOURCES_PATH = path.join(__dirname, '../../../tC_resources/resources');

/**
 * Moves all bibles from the static folder to the user's translationCore folder.
 */
export function getBibleFromStaticPackage(force = false) {
  try {
    let languagesIds = ['en', 'grc', 'he', 'hi']; // english, greek, hebrew.
    languagesIds.forEach((languagesId) => {
      const STATIC_RESOURCES_BIBLES_PATH = path.join(STATIC_RESOURCES_PATH, languagesId, 'bibles');
      const BIBLE_RESOURCES_PATH = path.join(USER_RESOURCES_PATH, languagesId, 'bibles');
      let bibleNames = fs.readdirSync(STATIC_RESOURCES_BIBLES_PATH);
      bibleNames.forEach((bibleName) => {
        let bibleSourcePath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleName);
        let bibleDestinationPath = path.join(BIBLE_RESOURCES_PATH, bibleName);
        if(!fs.existsSync(bibleDestinationPath) || force) {
          fs.copySync(bibleSourcePath, bibleDestinationPath);
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getTHelpsFromStaticPackage(force = false) {
  ['en','grc','hi'].forEach(languageId => {
    try {
      const staticTranslationHelpsPath = path.join(STATIC_RESOURCES_PATH, languageId, 'translationHelps');
      const userTranslationHelpsPath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps');
      const tHelpsNames = fs.readdirSync(staticTranslationHelpsPath);
      tHelpsNames.forEach((tHelpName) => {
        let tHelpSourcePath = path.join(staticTranslationHelpsPath, tHelpName);
        let tHelpDestinationPath = path.join(userTranslationHelpsPath, tHelpName);
        if(!fs.existsSync(tHelpDestinationPath) || force) {
          fs.copySync(tHelpSourcePath, tHelpDestinationPath);
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getLexiconsFromStaticPackage(force = false) {
  try {
    const languageId = 'en';
    const staticPath = path.join(STATIC_RESOURCES_PATH, languageId, 'lexicons');
    const userPath = path.join(USER_RESOURCES_PATH, languageId, 'lexicons');
    const folders = fs.readdirSync(staticPath);
    folders.forEach((folder) => {
      let sourcePath = path.join(staticPath, folder);
      let destinationPath = path.join(userPath, folder);
      if(!fs.existsSync(destinationPath) || force) {
        fs.copySync(sourcePath, destinationPath);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * @description - Auto generate the chapter index since more projects will use it
 */
export const chapterGroupsIndex = () => {
  const groupsIndex = Array(150).fill().map((_, i) => {
    let chapter = i + 1;
    return {
      id: 'chapter_' + chapter,
      name: 'Chapter ' + chapter
    };
  });
return groupsIndex;
};

export function copyGroupsDataToProjectResources(currentToolName, groupsDataDirectory, bookAbbreviation) {
  const languageId = currentToolName === 'translationWords' ? 'grc' : 'en';
  const toolResourcePath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps', currentToolName);
  const versionPath = getLatestVersionInPath(toolResourcePath);
  const groupsFolderPath = currentToolName === 'translationWords' ? path.join('kt', 'groups', bookAbbreviation) : path.join('groups', bookAbbreviation);
  const groupsDataSourcePath = path.join(versionPath, groupsFolderPath);

  if(fs.existsSync(groupsDataSourcePath)) {
    fs.copySync(groupsDataSourcePath, groupsDataDirectory);
  } else {
    const groupsData = chapterGroupsData(bookAbbreviation, currentToolName);
    groupsData.forEach(groupData => {
      const groupId = groupData[0].contextId.groupId;
      const chapterIndexPath = path.join(groupsDataDirectory, groupId + '.json');
      fs.outputFileSync(chapterIndexPath, JSON.stringify(groupData, null, 2));
    });
    console.log("Chapter Groups Data generated. translationHelps resources path was not found, " + groupsDataSourcePath);
  }
}
/**
 * @description - Auto generate the chapter index since more projects will use it
 * @param {String} bookId - id of the current book
 * @param {String} currentToolName - id of the current tool
 */
export const chapterGroupsData = (bookId, currentToolName) => {
  let groupsData = [];
  const versionPath = getLatestVersionInPath(path.join(STATIC_RESOURCES_PATH, 'en', 'bibles', 'ulb'));
  const ulbIndexPath = path.join(versionPath, 'index.json');
  if (fs.existsSync(ulbIndexPath)) { // make sure it doens't crash if the path doesn't exist
    const ulbIndex = fs.readJsonSync(ulbIndexPath); // the index of book/chapter/verses
    const bookData = ulbIndex[bookId]; // get the data in the index for the current book
    groupsData = Array(bookData.chapters).fill().map((_, i) => { // create array from number of chapters
      const chapter = i + 1; // index is 0 based, so add one for chapter number
      const verses = bookData[chapter]; // get the number of verses in the chapter
      const groupData = Array(verses).fill().map((_, i) => { // turn number of verses into array
        const verse = i + 1; // index is 0 based, so add one for verse number
        return {
          "contextId": {
            "reference": {
              "bookId": bookId,
              "chapter": chapter,
              "verse": verse
            },
            "tool": currentToolName,
            "groupId": "chapter_" + chapter
          }
        };
      });
      return groupData;
    });
  }
  return groupsData;
};

/**
 * @description Helper function to get a bibles manifest file from the bible resources folder.
 * @param {string} bibleVersionPath - path to a bibles version folder.
 * @param {string} bibleID - bible name. ex. bhp, uhb, udb, ulb.
 */
export function getBibleManifest(bibleVersionPath, bibleID) {
  let fileName = 'manifest.json';
  let bibleManifestPath = path.join(bibleVersionPath, fileName);
  let manifest;

  if(fs.existsSync(bibleManifestPath)) {
    manifest = fs.readJsonSync(bibleManifestPath);
  } else {
    console.error(`Could not find manifest for ${bibleID} at ${bibleManifestPath}`);
  }
  return manifest;
}

/**
 * @description Helper function to get a bibles index from the bible resources folder.
 * @param {string} languageId
 * @param {string} bibleId - bible name. ex. bhp, uhb, udb, ulb.
 * @param {string} bibleVersion - optional release version, if null then get latest
 */
export function getBibleIndex(languageId, bibleId, bibleVersion) {
  const STATIC_RESOURCES_BIBLES_PATH = path.join(__dirname, '../../../tC_resources/resources', languageId, 'bibles');
  const fileName = 'index.json';
  let bibleIndexPath;
  if (bibleVersion) {
    bibleIndexPath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId, bibleVersion, fileName);
  } else {
    const versionPath = getLatestVersionInPath(path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId));
    if (versionPath) {
      bibleIndexPath = path.join(versionPath, fileName);
    }
  }
  let index;

  if(fs.existsSync(bibleIndexPath)) {
    index = fs.readJsonSync(bibleIndexPath);
  } else {
    console.error("Could not find index for " + bibleId + ' ' + bibleVersion);
  }
  return index;
}

/**
 * Returns an array of versions found in the path that start with [vV]\d
 * @param {String} resourcePath - base path to search for versions
 * @return {Array} - array of versions, e.g. ['v1', 'v10', 'v1.1']
 */
export function getVersionsInPath(resourcePath) {
  if (! resourcePath || ! fs.pathExistsSync(resourcePath)) {
    return null;
  }
  const isVersionDirectory = name => { 
    const fullPath = path.join(resourcePath, name);
    return fs.lstatSync(fullPath).isDirectory() && name.match(/^v\d/i);
  };
  return fs.readdirSync(resourcePath).filter(isVersionDirectory);
}

/**
 * Returns a sorted an array of versions so that numeric parts are properly ordered (e.g. v10a < v100)
 * @param {Array} - array of versions unsorted: ['v05.5.2', 'v5.5.1', 'V6.21.0', 'v4.22.0', 'v6.1.0', 'v6.1a.0', 'v5.1.0', 'V4.5.0']
 * @return {Array} - array of versions sorted:  ["V4.5.0", "v4.22.0", "v5.1.0", "v5.5.1", "v05.5.2", "v6.1.0", "v6.1a.0", "V6.21.0"]
 */
export function sortVersions(versions) {
  // Don't sort if null, empty or not an array
  if (! versions || ! Array.isArray(versions)) {
    return versions;
  }
  // Only sort of all items are strings
  for(let i = 0; i < versions.length; ++i) {
    if (typeof versions[i] !== 'string') {
      return versions;
    }
  }
  versions.sort( (a, b) => String(a).localeCompare(b, undefined, { numeric:true }) );
  return versions;
}

/**
 * Return the full path to the highest version folder in resource path
 * @param {String} resourcePath - base path to search for versions
 * @return {String} - path to highest version
 */
export function getLatestVersionInPath(resourcePath) {
  const versions = sortVersions(getVersionsInPath(resourcePath));
  if (versions && versions.length) {
    return path.join(resourcePath, versions[versions.length-1]);
  }
  return null; // return illegal path
}

export function getLanguageIdsFromResourceFolder(bookId) {
  let languageIds = fs.readdirSync(USER_RESOURCES_PATH)
    .filter(folder => folder !== '.DS_Store'); // filter out .DS_Store
  // if its an old testament project remove greek from languageIds.
  if (BibleHelpers.isOldTestament(bookId)) {
    languageIds = languageIds.filter(languageId => languageId !== 'grc');
  } else { // else if its a new testament project remove hebrew from languageIds.
    languageIds = languageIds.filter(languageId => languageId !== 'he');
  }
  return languageIds;
}
