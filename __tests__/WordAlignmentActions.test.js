/* eslint-env jest */
import fs from 'fs-extra';
//actions
import * as WordAlignmentActions from '../src/js/actions/WordAlignmentActions';
jest.unmock('fs-extra');


describe('WordAlignmentActions.unmergeAlignments', () => {

  it('should reorder unordered greek', () => {
    const testPath = '__tests__/fixtures/splitWords/heb1-1_outOfOrder.json';
    const testData = fs.readJSONSync(testPath);
    const fromAlignmentIndex = 7;
    const alignmentsInitial = JSON.parse(JSON.stringify(testData.alignmentsInitial));

    const { alignments, wordBank } = WordAlignmentActions.unmergeAlignments(
      testData.removeItem, alignmentsInitial, testData.wordBank, fromAlignmentIndex, testData.greek, testData.verseString
    );
    expect(alignments).toEqual(testData.alignmentsFinal);
    expect(wordBank.length).toEqual(2);
  });
});
