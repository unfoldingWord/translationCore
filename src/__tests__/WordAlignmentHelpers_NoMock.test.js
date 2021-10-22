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
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerseSpan;
    let blankVerseAlignments = {};
    const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);
    const expectedFinal = testData.verseSpanData_TargetVerse;

    //when
    WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should not crash with invalid occurrence', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerseSpan;
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.occurrence = 2;
    let blankVerseAlignments = {};
    const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);
    const expectedFinal = testData.verseSpanData_TargetVerse;
    const alignment0_expected = expectedFinal.verseObjects[0];
    alignment0_expected.occurrence = 2;
    delete alignment0_expected.ref;

    //when
    WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should not crash with invalid occurrences', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerseSpan;
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.occurrences = 2;
    let blankVerseAlignments = {};
    const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);
    const expectedFinal = testData.verseSpanData_TargetVerse;

    //when
    WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should not crash with missing occurrence', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerseSpan;
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    delete alignment0.occurrence;
    let blankVerseAlignments = {};
    const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);
    const expectedFinal = testData.verseSpanData_TargetVerse;
    const alignment0_expected = expectedFinal.verseObjects[0];
    delete alignment0_expected.occurrence;
    delete alignment0_expected.ref;

    //when
    WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should not crash with missing occurrences', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerseSpan;
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    delete alignment0.occurrences;
    let blankVerseAlignments = {};
    const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);
    const expectedFinal = testData.verseSpanData_TargetVerse;

    //when
    WordAlignmentHelpers.convertAlignmentsFromVerseSpansToVerseSub(verseSpanData, low, hi, blankVerseAlignments, chapterNumber);

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
