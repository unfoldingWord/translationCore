/* eslint-disable no-template-curly-in-string */
/* eslint-disable default-case */
/* eslint-disable no-nested-ternary */
import fs from 'fs-extra';
import path from 'path-extra';
import _ from 'lodash';
import { getAlignedText, verseHelpers } from 'tc-ui-toolkit';
import { apiHelpers, resourcesHelpers } from 'tc-source-content-updater';
import { getCurrentToolName, getToolGatewayLanguage } from '../selectors';
import {
  LEXICONS,
  TRANSLATION_ACADEMY,
  TRANSLATION_HELPS,
  TRANSLATION_NOTES,
  TRANSLATION_WORDS,
  TRANSLATION_WORDS_LINKS,
  UGL_LEXICON,
  UHL_LEXICON,
  USER_RESOURCES_PATH,
  WORD_ALIGNMENT,
} from '../common/constants';
import { getLanguageByCodeSelection, sortByNamesCaseInsensitive } from './LanguageHelpers';
import * as ResourcesHelpers from './ResourcesHelpers';
import * as BibleHelpers from './bibleHelpers';
import ResourceAPI from './ResourceAPI';
import { isVerseSpan } from './WordAlignmentHelpers';

/**
 *
 * @param {Object} state - current state
 * @param {Object} contextId - optional contextId to use, otherwise uses current
 * @return {{gatewayLanguageCode: *, gatewayLanguageQuote: *}}
 */
export const getGatewayLanguageCodeAndQuote = (state, contextId = null) => {
  const toolName = getCurrentToolName(state);
  const gatewayLanguageCode = getToolGatewayLanguage(state, toolName);
  const { toolsSelectedGLs } = state.projectDetailsReducer.manifest;
  const gatewayLanguageQuote = getAlignedGLText(
    toolsSelectedGLs,
    contextId || state.contextIdReducer.contextId,
    state.resourcesReducer.bibles,
    toolName,
  );

  return {
    gatewayLanguageCode,
    gatewayLanguageQuote,
  };
};

/**
 * lookup required helps for tool to be supported Gateway Languages
 * @param toolName
 * @return {{gl: {alignedBookRequired: Boolean, minimumCheckingLevel: Number, helpsChecks: Array.<Object>},
 *           ol: {alignedBookRequired: Boolean, minimumCheckingLevel: Number, helpsChecks: Array.<Object>}}}
 */
export function getGlRequirementsForTool(toolName) {
  const requirements = { // init to default values
    gl: {
      alignedBookRequired: false,
      minimumCheckingLevel: 3,
      helpsChecks: [],
    },
    ol: {
      alignedBookRequired: false,
      minimumCheckingLevel: 2,
      helpsChecks: [],
    },
  };

  switch (toolName) {
  case WORD_ALIGNMENT:
    requirements.gl.minimumCheckingLevel = 3;
    requirements.gl.helpsChecks = [
      { path: path.join(LEXICONS) },
    ];
    break;

  case TRANSLATION_WORDS:
    requirements.gl.alignedBookRequired = true;
    requirements.gl.minimumCheckingLevel = 3;
    requirements.gl.helpsChecks = [
      {
        path: path.join(TRANSLATION_HELPS, TRANSLATION_WORDS),
        subpath: 'articles',
        minimumCheckingLevel: 2,
      },
    ];
    requirements.ol.helpsChecks = [
      {
        path: path.join(TRANSLATION_HELPS, TRANSLATION_WORDS),
        subpath: path.join('groups', '${bookID}'),
      },
    ];
    break;
  case TRANSLATION_NOTES:
    requirements.gl.alignedBookRequired = true;
    requirements.gl.helpsChecks = [
      { path: path.join(TRANSLATION_HELPS, TRANSLATION_ACADEMY) },
      {
        path: path.join(TRANSLATION_HELPS, TRANSLATION_NOTES),
        subpath: path.join('groups', '${bookID}'),
      },
    ];
    break;
  }
  return requirements;
}

/**
 * Returns an alphabetical list of Gateway Languages.  This list is determined by iterating through each language
 *          in resources and then each bible in that language to make sure that at least one bible is supported
 *          in that language.
 *          See getValidGatewayBibles() for rules that determine if a bible can be used as gateway source.
 *
 * @param {String|null} bookId - optionally filter on book
 * @param {String} toolName
 * @return {Object} set of supported languages
 */
export function getGatewayLanguageList(bookId = null, toolName = null) {
  const glRequirements = getGlRequirementsForTool(toolName);
  const languageBookData = getSupportedGatewayLanguageResourcesList(bookId, glRequirements, toolName);
  const supportedLanguageOwner = Object.keys(languageBookData);
  const supportedLanguages = supportedLanguageOwner.map(langAndOwner => {
    const { owner, version: code } = resourcesHelpers.splitVersionAndOwner(langAndOwner);

    let lang = getLanguageByCodeSelection(code);

    if (lang) {
      lang = _.cloneDeep(lang); // make duplicate before modifying
      const bookData = languageBookData[langAndOwner];
      lang.default_literal = bookData.default_literal;
      lang.bibles = bookData.bibles;
      lang.owner = owner;
      lang.lc = lang.code; // UI expects language code in lc
    }
    return lang;
  });
  return sortByNamesCaseInsensitive(supportedLanguages.filter(lang => lang));
}

/**
 * look for alignments in book.  Check first chapter and iterate through verseObjects.
 *    Return true when first alignment is found.
 * @param {Array} chapters
 * @param {String} bookPath
 * @return {*}
 */
function seeIfBookHasAlignments(chapters, bookPath) {
  let file = chapters.sort().find(item => (item.indexOf('1.') >= 0));

  if (!file) { // if couldn't find chapter one, fall back to first file found
    file = chapters[0];
  }

  if (file) {
    try {
      const chapter1 = fs.readJSONSync(path.join(bookPath, file));

      for (let verseNum of Object.keys(chapter1)) {
        const verse = chapter1[verseNum];

        if (verse && verse.verseObjects) {
          for (let vo of verse.verseObjects) {
            if (vo.tag === 'zaln') { // verse has alignments
              return true;
            }
          }
        }
      }
    } catch (e) {
      // read or parse error
    }
  }
  return false;
}

/**
 * verify that resource is present and meets requirements that it has manifest.json, optionally meets checking level,
 *    and optionally has alignment data
 *
 * @param {String} resourcePath
 * @param {String} bookId
 * @param {int} minCheckingLevel - checked if non-zero
 * @param {Boolean} needsAlignmentData - if true, we ensure that resource contains alignment data
 * @return {Boolean}
 */
function isValidResource(resourcePath, bookId, minCheckingLevel, needsAlignmentData = false) {
  const ultManifestPath = path.join(resourcePath, 'manifest.json');
  const bookPath = path.join(resourcePath, bookId);
  const manifestExists = fs.pathExistsSync(ultManifestPath);
  const hasBook = fs.pathExistsSync(bookPath);
  let validResource = manifestExists && hasBook;
  let missingAlignments = false;
  let missingBook = true;
  let sufficientCheckingLevel = true;

  if (validResource) {
    let files = ResourcesHelpers.getFilesInResourcePath(bookPath, '.json');
    validResource = files && files.length; // if book has files in it
    missingBook = !validResource;

    if (validResource && minCheckingLevel) { // should we validate checking level
      const manifest = ResourcesHelpers.getBibleManifest(resourcePath, bookId);
      const checkingLevel = manifest && manifest.checking && manifest.checking.checking_level;
      sufficientCheckingLevel = checkingLevel >= minCheckingLevel;
      validResource = validResource && sufficientCheckingLevel;
    }

    if (validResource && needsAlignmentData) { // should we validate alignment data
      let hasAlignments = seeIfBookHasAlignments(files, bookPath, validResource);
      missingAlignments = !hasAlignments;
      validResource = hasAlignments;
    }
  }

  if (!validResource) {
    console.log(`isValidResource() - ${resourcePath}, ${bookId} - invalid, manifest missing = ${!manifestExists}, book missing = ${!hasBook}, insufficient checking level = ${!sufficientCheckingLevel}`);
  }
  return {
    validResource,
    missingAlignments,
    missingBook,
    sufficientCheckingLevel,
  };
}

/**
 * does some basic validation checking that langPath+subPath is a resource folder and returns path to latest
 *  resource
 *
 * @param {String} langPath
 * @param {String} subpath
 * @param {string} ownerStr
 * @return {String} resource version path
 */
function getValidResourcePath(langPath, subpath, ownerStr) {
  const validPath = ResourceAPI.getLatestVersion(path.join(langPath, subpath), ownerStr);

  if (validPath) {
    const subFolders = ResourcesHelpers.getFoldersInResourceFolder(validPath);

    if (subFolders && subFolders.length) { // make sure it has subfolders
      return validPath;
    }
  }
  return null;
}

/**
 * get path for OL of book
 * @param {String} bookId - book to look up
 * @param {string} ownerStr
 * @return {String}
 */
export function getOlBookPath(bookId, ownerStr) {
  const { languageId, bibleId } = BibleHelpers.getOrigLangforBook(bookId);
  const originalSubPath = `${languageId}/bibles/${bibleId}`;
  const origPath = getValidResourcePath(USER_RESOURCES_PATH, originalSubPath, ownerStr);
  return origPath;
}

/**
 * test to make sure book has valid OL
 * @param {String} bookId - book to look up
 * @param {string} ownerStr
 * @param {Number} minimumCheckingLevel
 * @return {Boolean}
 */
export function hasValidOL(bookId, ownerStr, minimumCheckingLevel = 0) {
  const origPath = getOlBookPath(bookId, ownerStr);

  if (origPath) {
    const { validResource } = isValidResource(origPath, bookId, minimumCheckingLevel);
    return validResource;
  }
  return false;
}

/**
 * Returns a list of Gateway Languages bibles supported for book.  This list is determined by iterating through each
 *          bible in the language to make sure that at least one bible is supported.
 *          Supported books meet the following requirements
 *
 *    for WA tool (no helpsChecks):
 *      - supported bible:
 *          - contains the book, and which must have alignments
 *          - bible has a manifest
 *      - the book must also be present in the Original Language (such as el-x-koine).
 *    for other tools (with helpsChecks) have the requirements above plus:
 *       - the Original Language for book must be at least checking level 2 (in manifest).
 *       - the aligned bible in the gateway Language:
 *           - must be at least checking level 3 (in manifest).
 *           - all folder subpaths in helpsChecks must be present
 *
 * @param {String} toolName - name of current tool
 * @param {String} langCode - language to check
 * @param {string} bookId - optionally filter on book
 * @param {Object} biblesLoaded - bibles already loaded in the state
 * @return {Array} valid bibles that can be used for Gateway language
 */
export function getValidGatewayBiblesForTool(toolName, langCode, bookId, biblesLoaded = {}) {
  const glRequirements = getGlRequirementsForTool(toolName);
  const validBibles = getValidGatewayBibles(langCode, bookId, glRequirements, biblesLoaded, toolName);
  return validBibles;
}

/**
 * validate that folder exists
 * @param {String} folderPath
 * @return {boolean}
 */
function isDirectory(folderPath) {
  return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
}

/**
 *
 * @param {Array.<Object>} helpsChecks - list of helps to check
 * @param {String} languagePath
 * @param {String} bookID
 * @param {String} owner
 * @return {boolean}
 */
function hasValidHelps(helpsChecks, languagePath, bookID = '', owner = null) {
  let isBibleValidSource = true;
  const checkingHelps = helpsChecks && helpsChecks.length;

  if (checkingHelps) { // if no resource checking given, we skip checking
    isBibleValidSource = true;
    const helpsChecks_ = [...helpsChecks];

    if (owner !== apiHelpers.DOOR43_CATALOG) { // if other owner check if we need twls
      const tWHelpsPath = path.join(TRANSLATION_HELPS, TRANSLATION_WORDS);
      const hasTwDependency = helpsChecks.find(check => (check.path === tWHelpsPath));

      if (hasTwDependency) {
        // if TW is a dependency, add TWL also as a dependency
        helpsChecks_.push({
          path: path.join(TRANSLATION_HELPS, TRANSLATION_WORDS_LINKS),
          subpath: path.join('groups', '${bookID}'),
        });
      }
    }

    for (let helpsCheck of helpsChecks_) {
      let helpValid = false;
      const latestVersionPath = ResourceAPI.getLatestVersion(path.join(languagePath, helpsCheck.path), owner);

      if (latestVersionPath) {
        const subFolders = ResourcesHelpers.getFoldersInResourceFolder(latestVersionPath);

        if (subFolders && subFolders.length) { // make sure it has subfolders
          helpValid = subFolders.find(subFolder => {
            const subFolderPath = path.join(latestVersionPath, subFolder);
            let checkPath = subFolderPath;

            if (isDirectory(subFolderPath)) {
              let subpath = helpsCheck.subpath || '';
              checkPath = path.join(subFolderPath, subpath.replace('${bookID}', bookID));

              if (isDirectory(checkPath)) {
                const validFile = fs.readdirSync(checkPath).find(file => {
                  const ext = path.parse(file).ext;
                  return ((ext === '.json') || (ext === '.md'));
                });
                return validFile;
              }
            }
            return false;
          });
        }

        if (!helpValid) {
          console.log(`hasValidHelps() - In ${languagePath} owner ${owner}, ${latestVersionPath} - does not have valid content for book ${bookID}`);
        }

        if (helpsCheck.minimumCheckingLevel) {
          let checkingLevel = -1;
          const manifestPath = path.join(latestVersionPath, 'manifest.json');

          if (fs.existsSync(manifestPath)) {
            const manifest = fs.readJsonSync(manifestPath);
            checkingLevel = (manifest && manifest.checking && manifest.checking.checking_level) || -1;
          }

          const passedCheckingLevel = (checkingLevel >= helpsCheck.minimumCheckingLevel);

          if (!passedCheckingLevel) {
            console.log(`hasValidHelps() - In ${languagePath} owner ${owner}, ${bookID}, ${manifestPath} - checking level ${checkingLevel} is not greater than minimum ${helpsCheck.minimumCheckingLevel}`);
          }
          helpValid = helpValid && passedCheckingLevel;
        }
      } else if (helpsCheck.path.includes('lexicons')) {
        const lexiconId = BibleHelpers.isNewTestament(bookID) ? UGL_LEXICON : UHL_LEXICON;
        const langPaths = [languagePath];
        const pathParse = path.parse(languagePath);

        if (pathParse.base !== 'en') { // if long is not en, fall back to 'en'
          langPaths.push(path.join(pathParse.dir, 'en'));
        }

        for (const langPath of langPaths) {
          const lexiconsFolderPath = path.join(langPath, helpsCheck.path, lexiconId);

          if (fs.existsSync(lexiconsFolderPath)) {
            const lexiconLatestVersionPath = ResourceAPI.getLatestVersion(path.join(langPath, helpsCheck.path, lexiconId));

            if (fs.existsSync(path.join(lexiconLatestVersionPath, 'content'))) {
              helpValid = true;
              break;
            }
          }
        }
      }

      if (!helpValid) {
        console.log(`hasValidHelps() - In ${languagePath} owner ${owner}, ${bookID} failed check ${JSON.stringify(helpsCheck)}`);
      }
      isBibleValidSource = isBibleValidSource && helpValid;
    }
  }
  return isBibleValidSource;
}

/**
 * Returns a list of Gateway Languages bibles supported for book.  This list is determined by iterating through each
 *          bible in the language to make sure that at least one bible is supported.
 *          Supported books meet the following requirements
 *
 *    for WA tool (no helpsChecks):
 *      - supported bible:
 *          - contains the book, and which must have alignments
 *          - bible has a manifest
 *      - the book must also be present in the Original Language (such as el-x-koine).
 *    for other tools (with helpsChecks) have the requirements above plus:
 *       - the Original Language for book must be at least checking level 2 (in manifest).
 *       - the aligned bible in the gateway Language:
 *           - must be at least checking level 3 (in manifest).
 *           - all folder subpaths in helpsChecks must be present
 *
 * @param {String} langCode - language to check
 * @param {string} bookId - optionally filter on book
 * @param {Object} glRequirements - helpsPaths - see getGlRequirementsForTool() jsDocs for format
 * @param {Object} biblesLoaded - bibles already loaded in the state
 * @param {string} toolName - name of tool
 * @return {Array} valid bibles that can be used for Gateway language
 */
export function getValidGatewayBibles(langCode, bookId, glRequirements = {}, biblesLoaded = {}, toolName = '') {
  const languagePath = path.join(USER_RESOURCES_PATH, langCode);
  const biblesPath = path.join(languagePath, 'bibles');
  let bibles = fs.existsSync(biblesPath) ? fs.readdirSync(biblesPath).filter(folder => folder !== '.DS_Store') : [];
  const validBibles = [];
  const validHelpsCache = [];
  let foundBible = false;

  for (const bibleId of bibles) {
    if (!fs.lstatSync(path.join(biblesPath, bibleId)).isDirectory()) { // verify it's a valid directory
      continue;
    }

    const owners = ResourceAPI.getLatestVersionsAndOwners(path.join(biblesPath, bibleId)) || {};

    for (const owner of Object.keys(owners)) {
      let isBibleValidSource = false;
      let biblePath = owners[owner];

      if (biblePath) {
        if (validHelpsCache.hasOwnProperty(owner)) {
          isBibleValidSource = validHelpsCache[owner];
        } else {
          isBibleValidSource = hasValidHelps(glRequirements.gl.helpsChecks, languagePath, bookId, owner);
          validHelpsCache[owner] = isBibleValidSource;

          if (!isBibleValidSource) {
            console.log(`getValidGatewayBibles() - For owner ${owner}, ${langCode}, ${bookId} - valid helps not found for ${toolName}`);
          }
        }

        if (isBibleValidSource) {
          if (bookId) { // if filtering by book
            const origLangOwner = ResourcesHelpers.getOriginalLangOwner(owner);
            const isValidOrig = hasValidOL(bookId, origLangOwner, glRequirements.ol.minimumCheckingLevel); // make sure we have an OL for the book

            if (!isValidOrig) {
              console.log(`getValidGatewayBibles() - For owner ${owner}, ${bibleId}, ${langCode}, ${bookId} - valid original is not found for ${toolName}`);
            }
            isBibleValidSource = isBibleValidSource && isValidOrig;
            const isOrigLangInD43 = (origLangOwner === apiHelpers.DOOR43_CATALOG);

            if (glRequirements.ol.helpsChecks && glRequirements.ol.helpsChecks.length && isOrigLangInD43) {
              const olBook = BibleHelpers.getOrigLangforBook(bookId);
              const olPath = path.join(USER_RESOURCES_PATH, olBook.languageId);
              const hasValidOriginalHelps = hasValidHelps(glRequirements.ol.helpsChecks, olPath, bookId, origLangOwner);

              if (!hasValidOriginalHelps) {
                console.log(`getValidGatewayBibles() - For owner ${owner}, ${bibleId}, ${langCode}, ${bookId} - valid ORIGINAL helps not found for ${toolName}`);
              }
              isBibleValidSource = isBibleValidSource && hasValidOriginalHelps;
            }

            // make sure resource for book is present and has the right checking level
            const {
              validResource,
              missingAlignments,
              missingBook,
            } = isValidResource(biblePath, bookId,
              glRequirements.gl.minimumCheckingLevel, glRequirements.gl.alignedBookRequired);
            const isValidAlignedBible = biblePath && validResource;

            if (!isValidAlignedBible || !isBibleValidSource) {
              console.log(`getValidGatewayBibles() - For owner ${owner}, ${bibleId}, ${langCode}, ${bookId} - is NOT a VALID aligned bible for ${toolName}, isBibleValidSource = ${isBibleValidSource}, missingBook = ${missingBook}, missingAlignments = ${missingAlignments}`);
            } else {
              console.log(`getValidGatewayBibles() - For owner ${owner}, ${bibleId}, ${langCode}, ${bookId} - is VALID aligned bible for ${toolName}`);
            }
            isBibleValidSource = isBibleValidSource && isValidAlignedBible;
          }
        }
      }

      if (isBibleValidSource) {
        foundBible = true;
        const key = resourcesHelpers.addOwnerToKey(langCode, owner);
        const alreadyLoaded = biblesLoaded[key] && biblesLoaded[key][bibleId];

        if (!alreadyLoaded) {
          validBibles.push(resourcesHelpers.addOwnerToKey(bibleId, owner));
        }
      }
    }
  }

  if (bibles.length && !foundBible) {
    console.log(`getValidGatewayBibles() - For ${langCode}, ${bookId} - bibles ${JSON.stringify(bibles)} found, but none are valid for ${toolName}`);
  }
  return validBibles;
}

/**
 * Returns a list of Gateway Languages supported for book.  This list is determined by iterating through each language
 *          in resources and then each bible in that language to make sure that at least one bible is supported
 *          in that language.
 *          See getValidGatewayBibles() for rules that determine if a bible can be used as gateway source.
 *
 * @param {String|null} bookId - optionally filter on book
 * @param {Object} glRequirements - helpsPaths - see getGlRequirementsForTool() jsDocs for format
 * @param {String} toolName - tool name.
 * @return {Object} set of supported languages and their supported bibles
 */
export function getSupportedGatewayLanguageResourcesList(bookId = null, glRequirements = {}, toolName) {
  const allLanguages = ResourcesHelpers.getAllLanguageIdsFromResourceFolder(true) || [];
  const filteredLanguages = {};

  for (let language of allLanguages) {
    const validBibles = getValidGatewayBibles(language, bookId, glRequirements, {}, toolName);

    if (validBibles) {
      for (const validBible of validBibles) {
        const { owner } = resourcesHelpers.splitVersionAndOwner(validBible);
        const key = resourcesHelpers.addOwnerToKey(language, owner);

        if (!filteredLanguages[key]) {
          filteredLanguages[key] = {
            default_literal: validBible,
            bibles: [validBible],
          };
        } else {
          filteredLanguages[key].bibles.push(validBible);
        }
      }
    }
  }

  const enDefault = resourcesHelpers.addOwnerToKey('en', apiHelpers.DOOR43_CATALOG);

  if (!filteredLanguages[enDefault] && toolName === WORD_ALIGNMENT && !Object.keys(filteredLanguages).length) { // TODO: this is a temporary fix to be removed later
    const ultDefault = resourcesHelpers.addOwnerToKey('ult', apiHelpers.DOOR43_CATALOG);

    filteredLanguages[enDefault] = {
      default_literal: ultDefault,
      bibles: [ultDefault],
    };
  }
  return filteredLanguages;
}

/**
 * gets the quote as a string array
 * @param {Object} contextId
 * @return {Array}
 */
export function getQuoteAsArray(contextId) {
  let quoteArray = [];

  if (Array.isArray(contextId.quote)) {
    for (let i = 0, l = contextId.quote.length; i < l; i++) {
      const wordItem = contextId.quote[i];
      quoteArray.push(wordItem.word);
    }
  } else {
    quoteArray = contextId.quote.split(' ');
  }
  return quoteArray;
}

/**
 * get the selected text from the GL resource for this context
 * @param {*} toolsSelectedGLs
 * @param {*} contextId
 * @param {*} bibles - list of resources
 * @param {*} currentToolName - such as translationWords
 */
export function getAlignedGLText(toolsSelectedGLs, contextId, bibles, currentToolName) {
  const selectedGL = toolsSelectedGLs[currentToolName];

  if (!contextId.quote || !bibles || !bibles[selectedGL] || !Object.keys(bibles[selectedGL]).length) {
    return contextId.quote;
  }

  const sortedBibleIds = Object.keys(bibles[selectedGL]).sort(bibleIdSort);

  for (let i = 0; i < sortedBibleIds.length; ++i) {
    const bible = bibles[selectedGL][sortedBibleIds[i]];
    const alignedText = getAlignedTextFromBible(contextId, bible);

    if (alignedText) {
      return alignedText;
    }
  }
  return contextId.quote;
}

/**
 * gets the aligned GL text from the given bible
 * @param {object} contextId
 * @param {object} bible
 * @returns {string}
 */
export function getAlignedTextFromBible(contextId, bible) {
  if (bible && contextId?.reference) {
    const chapterData = bible[contextId.reference.chapter];
    const verseRef = contextId.reference.verse;
    const verseData = chapterData?.[verseRef];
    let verseObjects = null;

    if (verseData) { // if we found verse
      verseObjects = verseData.verseObjects;
    } else if (isVerseSpan(verseRef)) { // if we didn't find verse, check if verse span
      verseObjects = [];
      // iterate through all verses in span
      const { low, hi } = verseHelpers.getVerseRangeFromSpan(verseRef);

      for (let i = low; i <= hi; i++) {
        const verseObjects_ = chapterData?.[i]?.verseObjects;

        if (!verseObjects_) { // if verse missing, abort
          verseObjects = null;
          break;
        }
        verseObjects = verseObjects.concat(verseObjects_);
      }
    }
    return getAlignedText(verseObjects, contextId.quote, contextId.occurrence);
  }
}

/**
 * Return book code with highest precedence
 * @param {*} a - First book code of 2
 * @param {*} b - second book code
 */
export function bibleIdSort(a, b) {
  const biblePrecedence = ['udb', 'ust', 'ulb', 'ult', 'irv']; // these should come first in this order if more than one aligned Bible, from least to greatest

  if (biblePrecedence.indexOf(a) === biblePrecedence.indexOf(b)) {
    return (a < b ? -1 : a > b ? 1 : 0);
  } else {
    return biblePrecedence.indexOf(b) - biblePrecedence.indexOf(a);
  } // this plays off the fact other Bible IDs will be -1
}
