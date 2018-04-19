/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path';
jest.unmock('fs-extra');
//helpers
import * as AlignmentHelpers from '../src/js/helpers/AlignmentHelpers';

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
  it('handles matt 1-1a', () => {
    mergeTest('matt1-1a');
  });
  it('handles matt 1-1b', () => {
    mergeTest('matt1-1b');
  });
  it('handles matt 1-1', () => {
    mergeTest('matt1-1');
  });
  it('handles noncontiguous', () => {
    mergeTest('noncontiguous');
  });
  it('handles contiguousAndNonContiguous', () => {
    mergeTest('contiguousAndNonContiguous');
  });
  it('handles titus 1-1', () => {
    mergeTest('tit1-1');
  });
  it('handles titus 1-1 unaligned extra word in wordbank', () => {
    mergeTest('tit1-1_unaligned_extra_in_wordbank');
  });
  it('handles titus 1-1 unaligned missing word in wordbank', () => {
    mergeTest('tit1-1_unaligned_missing_in_wordbank');
  });
  it('handles titus 1-1 partial aligned', () => {
    mergeTest('tit1-1_partial_aligned');
  });
  it('handles titus 1-1 partial aligned extra word in wordbank', () => {
    function test_error() {
      mergeTest('tit1-1_partial_extra_in_wordbank');
    }
    expect(test_error).toThrowErrorMatchingSnapshot();
  });
  it('handles titus 1-1 partial aligned missing word in wordbank', () => {
    function test_error() {
      mergeTest('tit1-1_partial_missing_in_wordbank');
    }
    expect(test_error).toThrowErrorMatchingSnapshot();
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
  it('handles matt 1-1a', () => {
    unmergeTest('matt1-1a');
  });
  it('handles matt 1-1b', () => {
    unmergeTest('matt1-1b');
  });
  it('handles matt 1-1', () => {
    unmergeTest('matt1-1');
  });
  it('handles noncontiguous', () => {
    unmergeTest('noncontiguous');
  });
  it('handles contiguousAndNonContiguous', () => {
    unmergeTest('contiguousAndNonContiguous');
  });
  it('handles titus 1-1', () => {
    unmergeTest('tit1-1');
  });
  it('handles titus 1-1 nested milestones', () => {
    unmergeTest('tit1-1.nested_milestones');
  });
  it('handles titus 1-1 nested milestones, merged greek', () => {
    unmergeTest('tit1-1.nested_milestones_merged_greek');
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
  // let usfmData = usfm.toUSFM(jsonChunk);
  // console.log(usfmData);
  expect(output).toEqual(verseObjects);
};
/**
 * Generator for testing unmerging of alignment from verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const unmergeTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const {verseObjects, alignment, wordBank, alignedVerseString} = json;
  const output = AlignmentHelpers.unmerge(verseObjects, alignedVerseString);
  expect(output).toEqual({alignment, wordBank});
};
