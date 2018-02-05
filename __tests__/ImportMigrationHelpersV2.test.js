import path from 'path';
import * as fs from 'fs-extra';
/* eslint-env jest */
/* eslint-disable no-console */
'use strict';
import migrateToVersion2 from "../src/js/helpers/ProjectMigration/migrateToVersion2";
import * as MigrateToVersion2 from "../src/js/helpers/ProjectMigration/migrateToVersion2";
import * as Version from "../src/js/helpers/ProjectMigration/VersionUtils";
jest.mock('fs-extra');

import XRegExp from 'xregexp';
// constants
export const word = XRegExp('[\\pL\\pM]+', '');
export const punctuation = XRegExp('(^\\p{P}|[<>]{2})', '');
export const whitespace = /\s+/;
const tokenizerOptions = {word, whitespace, punctuation};

const manifest = {
  "project": {"id": "mat", "name": ""},
  "type": {"id": "text", "name": "Text"},
  "generator": {"name": "ts-android", "build": 175},
  "package_version": 7,
  "target_language": {
    "name": "ગુજરાતી",
    "direction": "ltr",
    "anglicized_name": "Gujarati",
    "region": "Asia",
    "is_gateway_language": false,
    "id": "gu"
  },
  "format": "usfm",
  "resource": {"id": "reg"},
  "translators": ["qa99"],
  "parent_draft": {"resource_id": "ulb", "checking_level": "3", "version": "1"},
  "source_translations": [{
    "language_id": "gu",
    "resource_id": "ulb",
    "checking_level": "3",
    "date_modified": 20161008,
    "version": "1"
  }]
};
const PROJECT_PATH = '__tests__/fixtures/project/migration/v1_project';

describe('migrateToVersion2', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [PROJECT_PATH]:[],
      [path.join(PROJECT_PATH, 'manifest.json')]: manifest
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('with no tc_version expect to set', () => {
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(MigrateToVersion2.MIGRATE_MANIFEST_VERSION).toBe(2); // this shouldn't change
    expect(version).toBe(MigrateToVersion2.MIGRATE_MANIFEST_VERSION);
  });

  it('with lower tc_version expect to update version', () => {
    Version.setVersionInManifest(PROJECT_PATH, MigrateToVersion2.MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(MigrateToVersion2.MIGRATE_MANIFEST_VERSION);
  });

  it('with higher tc_version expect to leave alone', () => {
    const manifestVersion = MigrateToVersion2.MIGRATE_MANIFEST_VERSION + 1;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    expect(version).toBe(manifestVersion);
  });

  it('with lower tc_version expect to update strongs to strong in alignment data', () => {
    const testVerse = 10;
    const testAlignment = 4;
    const sourcePath = "__tests__/fixtures/project/3jn_alignment/";
    const copyFiles = ['alignmentData'];
    const PROJECT_ALIGNMENT_DATA_PATH = path.join(PROJECT_PATH, '.app', 'translationCore');
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECT_ALIGNMENT_DATA_PATH);
    const chapter1_alignment_path = path.join(PROJECT_ALIGNMENT_DATA_PATH, 'alignmentData', '3jn', '1.json');

    // make sure test data set up correctly
    let word = getFirstWordFromChapter(chapter1_alignment_path, testVerse, testAlignment);
    expect(word.strong).not.toBeDefined();
    expect(typeof word.strongs).toEqual("string");

    Version.setVersionInManifest(PROJECT_PATH, MigrateToVersion2.MIGRATE_MANIFEST_VERSION - 1);
    migrateToVersion2(PROJECT_PATH);
    const version = Version.getVersionFromManifest(PROJECT_PATH);

    // strongs should be updated
    word = getFirstWordFromChapter(chapter1_alignment_path, testVerse, testAlignment);
    expect(word.strongs).not.toBeDefined();
    expect(typeof word.strong).toEqual("string");

    expect(version).toBe(MigrateToVersion2.MIGRATE_MANIFEST_VERSION);
  });
});

//
// helpers
//

const getFirstWordFromChapter = function (alignment_file, verse, alignment) {
  const chapter = fs.readJsonSync(alignment_file);
  const vs10 = chapter[verse];
  const alignment4 = vs10.alignments[alignment];
  return alignment4.topWords[0];

};

/////////////////////////////////////////////////////////////////////////////
// version 1 methods - from WordAlignmentHelpers.js
/////////////////////////////////////////////////////////////////////////////

/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 * TODO: Replace with the tokenizer version of this to prevent puctuation issues
 * Cannot replace with tokenizer until tokenizer handles all greek use cases that broke tokenizer
 */
const OLD_getOccurrenceInString = (string, currentWordIndex, subString) => {
  let arrayOfStrings = string.split(' ');
  let occurrence = 1;
  let slicedStrings = arrayOfStrings.slice(0, currentWordIndex);

  slicedStrings.forEach((slicedString) => {
    if (slicedStrings.includes(subString)) {
      slicedString === subString ? occurrence += 1 : null;
    } else {
      occurrence = 1;
    }
  });
  return occurrence;
};

/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 * modified to fit our use cases, return zero for '' substring, and no use case for overlapping.
 */
const OLD_occurrencesInString = (string, subString) => {
  if (subString.length <= 0) return 0;
  let occurrences = 0, position = 0, step = subString.length;
  while (position < string.length) {
    position = string.indexOf(subString, position);
    if (position === -1) break;
    ++occurrences;
    position += step;
  }
  return occurrences;
};

/////////////////////////////////////////////////////////////////////////////
// version 2 methods from stringHelpers.js
/////////////////////////////////////////////////////////////////////////////

/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenize = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  const tokens = _tokens.filter(token => token.type === 'word')
    .map(token => token.token);
  return tokens;
};
/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenizeWithPunctuation = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  const tokens = _tokens.filter(token => token.type === 'word' || token.type === 'punctuation')
    .map(token => token.token);
  return tokens;
};

/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 */
const NEW_occurrenceInString = (string, currentWordIndex, subString) => {
  let occurrence = 0;
  const tokens = tokenize(string);
  tokens.forEach((token, index) => {
    if (token === subString && index <= currentWordIndex) occurrence ++;
  });
  return occurrence;
};

/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 */
const NEW_occurrencesInString = (string, subString) => {
  let occurrences = 0;
  const tokens = tokenize(string);
  tokens.forEach(token => {
    if (token === subString) occurrences ++;
  });
  return occurrences;
};

/**
 * @Description - Tiny tokenizer - https://gist.github.com/borgar/451393
 * @Param {String} string - string to be tokenized
 * @Param {Object} parsers - { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }
 * @Param {String} deftok - type to label tokens that are not classified with the above parsers
 * @Return {Array} - array of objects => [{ token:"this", type:"word" },{ token:" ", type:"whitespace" }, Object { token:"is", type:"word" }, ... ]
 **/
const classifyTokens = (string, parsers, deftok) => {
  string = (!string) ? '' : string; // if string is undefined, make it an empty string
  if (typeof string !== 'string')
    throw 'tokenizer.tokenize() string is not String: ' + string;
  let m, r, t, tokens = [];
  while (string) {
    t = null;
    m = string.length;
    for ( let key in parsers ) {
      r = parsers[ key ].exec( string );
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      if ( r && ( r.index < m ) ) {
        t = {
          token: r[ 0 ],
          type: key,
          matches: r.slice( 1 )
        };
        m = r.index;
      }
    }
    if ( m ) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        token : string.substr( 0, m ),
        type  : deftok || 'unknown'
      });
    }
    if ( t ) {
      // push current token onto sequence
      tokens.push( t );
    }
    string = string.substr( m + (t ? t.token.length : 0) );
  }
  return tokens;
};
