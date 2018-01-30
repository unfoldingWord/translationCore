/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path';
jest.unmock('fs-extra');
//helpers
import * as AlignmentHelpers from '../src/js/helpers/AlignmentHelpers';
import usfm from "usfm-js";

const RESOURCES = path.join('__tests__','fixtures','pivotAlignmentVerseObjects');

describe("Merge Alignment into Verse Objects", () => {
  it('handles one to one', () => {
    mergeTest('oneToOne');
  });
  it('handles one to many', () => {
    mergeTest('oneToMany');
  });
  it('handles many to one', () => {
    mergeTest('manyToOne');
  });
  it('handles many to many', () => {
    mergeTest('manyToMany');
  });
  it('handles one to none', () => {
    mergeTest('oneToNone');
  });
  it('handles out of order', () => {
    mergeTest('outOfOrder');
  });
  it('handles matt 1:1a', () => {
    mergeTest('matt1:1a');
  });
  it('handles matt 1:1b', () => {
    mergeTest('matt1:1b');
  });
  it('handles matt 1:1', () => {
    mergeTest('matt1:1');
  });
  it('handles noncontiguous', () => {
    mergeTest('noncontiguous');
  });
  it('handles contiguousAndNonContiguous', () => {
    mergeTest('contiguousAndNonContiguous');
  });
  it('handles titus 1:1', () => {
    mergeTest('tit1:1');
  });
});


describe("UnMerge Alignment from Verse Objects", () => {
  it('handles one to one', () => {
    unmergeTest('oneToOne');
  });
  it('handles one to many', () => {
    unmergeTest('oneToMany');
  });
  it('handles many to one', () => {
    unmergeTest('manyToOne');
  });
  it('handles many to many', () => {
    unmergeTest('manyToMany');
  });
  it('handles one to none', () => {
    unmergeTest('oneToNone');
  });
  it('handles out of order', () => {
    unmergeTest('outOfOrder');
  });
  it('handles matt 1:1a', () => {
    unmergeTest('matt1:1a');
  });
  it('handles matt 1:1b', () => {
    unmergeTest('matt1:1b');
  });
  it('handles matt 1:1', () => {
    unmergeTest('matt1:1');
  });
  it('handles noncontiguous', () => {
    unmergeTest('noncontiguous');
  });
  it('handles contiguousAndNonContiguous', () => {
    unmergeTest('contiguousAndNonContiguous');
  });
  it('handles titus 1:1', () => {
    unmergeTest('tit1:1');
  });
});

/**
 * Reads a usfm file from the resources dir
 * @param {string} filePath relative path to usfm file
 * @return {string} sdv
 */
const readJSON = filename => {
  const fullPath = path.join(RESOURCES, filename);
  if (fs.existsSync(fullPath)) {
    const json = fs.readJsonSync(fullPath);
    return json;
  } else {
    console.log('File not found.');
    return false;
  }
};
/**
 * Generator for testing merging of alignment into verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const mergeTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const {alignment, verseObjects, verseString, wordBank} = json;
  const output = AlignmentHelpers.merge(alignment, wordBank, verseString);
  const jsonChunk = {
    "headers": [],
    "chapters": {},
    "verses": {
      "1": verseObjects
    }
  };
  let usfmData = usfm.toUSFM(jsonChunk);
  console.log(usfmData);
  expect(output).toEqual(verseObjects);
};
/**
 * Generator for testing unmerging of alignment from verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const unmergeTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const {verseObjects, alignment, wordBank} = json;
  const output = AlignmentHelpers.unmerge(verseObjects);
  expect(output).toEqual({alignment, wordBank});
};
