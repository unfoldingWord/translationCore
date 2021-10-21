/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as UsfmFileConversionHelpers from '../js/helpers/FileConversionHelpers/UsfmFileConversionHelpers';
import * as WordAlignmentHelpers from '../js/helpers/WordAlignmentHelpers';
//consts
const TEST_DATA_FOLDER = './src/__tests__/fixtures/pivotAlignmentVerseObjects';
jest.unmock('fs-extra');

describe('UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub', () => {
  it('should succeed with gal 1:1-2', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    let blankVerseAlignments = {};
    const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;

    // combine all original language verses into a verse span
    let originalVerseSpanData = [];

    for (let verse_ = low; verse_ <= hi; verse_++) {
      const verseData = testData.origLangChapterJson[verse_];
      originalVerseSpanData = originalVerseSpanData.concat(verseData && verseData.verseObjects || []);
    }

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

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
