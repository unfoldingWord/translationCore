import fs from 'fs-extra';
import path from "path-extra";

import * as groupsIndexHelpers from './groupsIndexHelpers';
import {getLanguageByCodeSelection, sortByNamesCaseInsensitive} from "./LanguageHelpers";
import {isNtBook} from "./ToolCardHelpers";
import * as ResourcesHelpers from "./ResourcesHelpers";

export const DEFAULT_GATEWAY_LANGUAGE = 'en';

export function getGatewayLanguageCodeAndQuote(state) {
  const { currentProjectToolsSelectedGL } = state.projectDetailsReducer;
  const { currentToolName } = state.toolsReducer;
  const { groupsIndex } = state.groupsIndexReducer;
  const { groupId } = state.contextIdReducer.contextId;
  const gatewayLanguageCode = currentProjectToolsSelectedGL[currentToolName];
  const gatewayLanguageQuote = groupsIndexHelpers.getGroupFromGroupsIndex(groupsIndex, groupId).name;

  return {
    gatewayLanguageCode,
    gatewayLanguageQuote
  };
}

/**
 * Returns an alphabetical list of Gateway Languages
 * @param {string|null} bookId - optionally filter on book
 * @return {Array} list of languages
 */
export function getGatewayLanguageList(bookId) {
  const languageIds = getSupportedResourceLanguageList(bookId);
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
 * @param {int} minCheckingLevel
 * @return {Boolean}
 */
function hasResource(resourcePath, bookId, minCheckingLevel) {
  const ultManifestPath = path.join(resourcePath, 'manifest.json');
  let validResource = fs.pathExistsSync(ultManifestPath);
  if (validResource) {
    let files = ResourcesHelpers.getFilesInResourcePath(path.join(resourcePath, bookId), '.json');
    validResource = files && files.length; // if book has files in it
    const manifest = validResource ? ResourcesHelpers.getBibleManifest(resourcePath, bookId) : null;
    validResource = validResource && manifest && manifest.checking && manifest.checking.checking_level;
    validResource = validResource && (manifest.checking.checking_level >= minCheckingLevel);
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
 * @param {string|null} bookId - optionally filter on book
 */
export function getSupportedResourceLanguageList(bookId) {
  const allLanguages = ResourcesHelpers.getAllLanguageIdsFromResourceFolder(true) || [];
  const filteredLanguages = allLanguages.filter(language => {
    const langPath = path.join(ResourcesHelpers.USER_RESOURCES_PATH, language);
    const ultPath = getValidResourcePath(langPath, 'bibles/ult');
    const twPath = getValidResourcePath(langPath, 'translationHelps/translationWords');
    if (ultPath && twPath) {
      if (!bookId) { // if not filtering by book, is good enough
        return true;
      } else {

        // Tricky:  the TW is now extracted from the UGNT, so we check have to validate that the UGNT supports
        //    the book and has the right checking level
        const originalSubPath = isNtBook(bookId) ? 'grc/bibles/ugnt' : 'he/bibles/uhb';
        const origPath = getValidResourcePath(ResourcesHelpers.USER_RESOURCES_PATH, originalSubPath);
        const isValidOrig = origPath && hasResource(origPath, bookId, 2);

        // make sure resource for book is present and has the right checking level
        const isValidUlt = ultPath && hasResource(ultPath, bookId, 3);
        return isValidUlt && isValidOrig;
      }
    }
    return false;
  });
  return filteredLanguages;
}
