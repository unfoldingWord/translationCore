/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path';
jest.unmock('fs-extra');
//helpers
import * as PivotAlignmentHelpers from '../src/js/helpers/PivotAlignmentHelpers';

const RESOURCES = path.join('__tests__','fixtures','pivotAlignmentVerseObjects');

describe("", () => {
  it('handles many to many', () => {
  });
});

describe("Pivot Alignment to Verse Objects", () => {

  // it('handles many to many', () => {
  //   generateTest('manyToMany');
  // });

  // it('handles many to one', () => {
  //   generateTest('manyToOne');
  // });

  // it('handles one to many', () => {
  //   generateTest('oneToMany');
  // });

  // it('handles one to none', () => {
  //   generateTest('oneToNone');
  // });

  // it('handles one to one', () => {
  //   generateTest('oneToOne');
  // });

  // it('handles matt 1:1', () => {
  //   generateTest('matt1:1');
  // });

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
 * Generator for testing usfm to json migration
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 * @param {object} args - optional arguments to be passed to the converter
 */
const generateTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const {alignment, alignedVerseString, verseObjects, verseString, wordBank} = json;
  const output = PivotAlignmentHelpers.verseObjectsFromAlignmentsAndWordBank(alignment, wordBank, verseString, alignedVerseString);
  expect(output).toEqual(verseObjects);
};
