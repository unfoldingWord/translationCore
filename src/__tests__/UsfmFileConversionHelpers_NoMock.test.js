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
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with invalid chapter', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '2:2';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with invalid verse', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '1:3';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with missing verse', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '1:';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with empty ref', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with no ref', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    delete alignment0.ref;
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with text ref', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = 'front';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with text chapter', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = 'front:1';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with text verse', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '1:front';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should handle missing chapter', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '1';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with no chapter and invalid verse', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.ref = '3';
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with missing occurrence', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    delete alignment0.occurrence;
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with 0 occurrence', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.occurrence = 0;
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

    //when
    UsfmFileConversionHelpers.convertAlignmentFromVerseToVerseSpanSub(originalVerseSpanData, verseSpanData, chapterNumber, low, hi, blankVerseAlignments);

    //then
    expect(verseSpanData).toEqual(expectedFinal);
  });

  it('should invalidate alignment with too high occurrence', () => {
    //given
    const testDataFile = 'gal1-1_2-span.json';
    const testData = getTestData(testDataFile);
    const chapterNumber = 1;
    const verseSpan = `1-2`;
    const verseSpanData = testData.verseSpanData_TargetVerse;
    const {
      blankVerseAlignments,
      low,
      hi,
      originalVerseSpanData,
    } = generateVerseSpanTestData(verseSpan, testData);
    // modify first alignment
    const alignment0 = verseSpanData.verseObjects[0];
    alignment0.occurrence = 2;
    const expectedFinal = testData.verseSpanData_TargetVerseSpan;
    // expect alignment to be invalidated
    const alignment0_expected = expectedFinal.verseObjects[0];
    UsfmFileConversionHelpers.invalidateAlignment(alignment0_expected);

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

function generateVerseSpanTestData(verseSpan, testData) {
  let blankVerseAlignments = {};
  const { low, hi } = WordAlignmentHelpers.getRawAlignmentsForVerseSpan(verseSpan, testData.origLangChapterJson, blankVerseAlignments);

  // combine all original language verses in the span range into a single verse span
  let originalVerseSpanData = [];

  for (let verse_ = low; verse_ <= hi; verse_++) {
    const verseData = testData.origLangChapterJson[verse_];
    originalVerseSpanData = originalVerseSpanData.concat(verseData && verseData.verseObjects || []);
  }
  return {
    blankVerseAlignments,
    low,
    hi,
    originalVerseSpanData,
  };
}
