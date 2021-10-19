/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as WordAlignmentHelpers from '../js/helpers/WordAlignmentHelpers';
//consts
const TEST_DATA_FOLDER = './src/__tests__/fixtures/pivotAlignmentVerseObjects';
jest.unmock('fs-extra');

describe('WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub', () => {

  it('should succeed with gal 1:1-2', () => {
    //given
    const testDataFile = 'gal1-1_2-verseSpan.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const low = 1;
    const hi = 2;
    const verseSpanData = testData.verseSpanData;
    const verseAlignments = testData.verseAlignments;
    const expectedFinal = testData.verseSpanData_Final;

    //when
    WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, verseAlignments, chapterNumber);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });
});

//
// helpers
//

const getTestData = function (alignment_file) {
  const dataPath = path.join(TEST_DATA_FOLDER, alignment_file);
  return fs.readJsonSync(dataPath);
};
