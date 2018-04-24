import fs from 'fs-extra';
import path from "path-extra";

import * as groupsIndexHelpers from './groupsIndexHelpers';
import {getLanguageByCodeSelection, sortByNamesCaseInsensitive} from "./LanguageHelpers";
import {isNtBook} from "./ToolCardHelpers";
import * as ResourcesHelpers from "./ResourcesHelpers";

export const DEFAULT_GATEWAY_LANGUAGE = 'en';

/**
 *
 * @param {Object} state - current state
 * @param {Object} contextId - optional contextId to use, otherwise uses current
 * @return {{gatewayLanguageCode: *, gatewayLanguageQuote: *}}
 */
export const getGatewayLanguageCodeAndQuote = (state, contextId = null) => {
  const { currentProjectToolsSelectedGL } = state.projectDetailsReducer;
  const { currentToolName } = state.toolsReducer;
  const { groupsIndex } = state.groupsIndexReducer;
  const { groupId } = contextId || state.contextIdReducer.contextId;
  const gatewayLanguageCode = currentProjectToolsSelectedGL[currentToolName];
  const gatewayLanguageQuote = groupsIndexHelpers.getGroupFromGroupsIndex(groupsIndex, groupId).name;

  return {
    gatewayLanguageCode,
    gatewayLanguageQuote
  };
};

/**
 * Returns an alphabetical list of Gateway Languages
 * @param {string} bookId - optionally filter on book
 * @param {Boolean} twCheck - if true do more thurough testing for translation words
 * @return {Array} list of languages
 */
export function getGatewayLanguageList(bookId = null, twCheck = false) {
  const languageIds = getSupportedResourceLanguageList(bookId, twCheck);
  const languages = languageIds.map(code => {
    const lang = getLanguageByCodeSelection(code);
    if (lang) {
      lang.lc = lang.code; // UI expects language code in lc
    }
    return lang;
  });
  return sortByNamesCaseInsensitive(languages);
}

/**
 * verify that resource is present and meets requirements
 * @param {String} resourcePath
 * @param {String} bookId
 * @param {int} minCheckingLevel - checked if non-zero
 * @return {Boolean}
 */
function hasResource(resourcePath, bookId, minCheckingLevel) {
  const ultManifestPath = path.join(resourcePath, 'manifest.json');
  const bookPath = path.join(resourcePath, bookId);
  let validResource = fs.pathExistsSync(ultManifestPath) && fs.pathExistsSync(bookPath);
  if (validResource) {
    let files = ResourcesHelpers.getFilesInResourcePath(bookPath, '.json');
    validResource = files && files.length; // if book has files in it
    if (validResource && minCheckingLevel) {
      const manifest = ResourcesHelpers.getBibleManifest(resourcePath, bookId);
      validResource = manifest && manifest.checking && manifest.checking.checking_level;
      validResource = validResource && (manifest.checking.checking_level >= minCheckingLevel);
    }
  }
  return validResource;
}

/**
 * does some basic validation checking that langPath+subPath is a resource folder and returns path to latest
 *  resource
 *
 * @param {String} langPath
 * @param {String} subpath
 * @return {String} resource version path
 */
function getValidResourcePath(langPath, subpath) {
  const validPath = ResourcesHelpers.getLatestVersionInPath(path.join(langPath, subpath));
  if (validPath) {
    const subFolders = ResourcesHelpers.getFoldersInResourceFolder(validPath);
    if (subFolders && subFolders.length) { // make sure it has subfolders
      return validPath;
    }
  }
  return null;
}

/**
 * Returns a list of Gateway Languages supported for book
 * @param {string} bookId - optionally filter on book
 * @param {Boolean} twCheck - if true do more thurough testing for translation words
 * @return {Array} list of supported languages
 */
export function getSupportedResourceLanguageList(bookId = null, twCheck = false) {
  const allLanguages = ResourcesHelpers.getAllLanguageIdsFromResourceFolder(true) || [];
  const filteredLanguages = allLanguages.filter(language => {
    const langPath = path.join(ResourcesHelpers.USER_RESOURCES_PATH, language);
    let ultPath = getValidResourcePath(langPath, 'bibles/ult');
    if (!ultPath) { // fallback to ulb for some languages
      ultPath = getValidResourcePath(langPath, 'bibles/ulb');
    }
    const twValid = !twCheck || !!getValidResourcePath(langPath, 'translationHelps/translationWords');
    if (ultPath && twValid) {
      if (!bookId) { // if not filtering by book, is good enough
        return true;
      } else {
        const originalSubPath = isNtBook(bookId) ? 'grc/bibles/ugnt' : 'he/bibles/uhb';
        const origPath = getValidResourcePath(ResourcesHelpers.USER_RESOURCES_PATH, originalSubPath);
        // Tricky:  the TW is now extracted from the UGNT. So for twChecking, we also have to validate that the UGNT/UHB
        //    has the right checking level
        const isValidOrig = origPath && hasResource(origPath, bookId, twCheck ? 2 : 0);

        // make sure resource for book is present and has the right checking level
        const isValidUlt = ultPath && hasResource(ultPath, bookId, twCheck ? 3 : 0);
        return isValidUlt && isValidOrig;
      }
    }
    return false;
  });
  return filteredLanguages;
}
