/* eslint-env jest */
import fs from 'fs-extra';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
//actions
import * as WordAlignmentActions from '../src/js/actions/WordAlignmentActions';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
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

describe('WordAlignmentActions.displayAlignmentErrorsPrompt', () => {
  const expectedActions = [
    {
      type: 'OPEN_OPTION_DIALOG',
      alertMessage: 'Some alignments have been invalidated! To fix the invalidated alignment,open the project in the Word Alignment Tool. If you proceed with the export, the alignment for these verses will be reset.',
      callback: expect.any(Function),
      button1Text: 'Export',
      button2Text: 'Cancel'
    }
  ];
  const initialState = {};
  const store = mockStore(initialState);
  it('should display an alert modal asking user to select usfm type', () => {
    store.dispatch(WordAlignmentActions.displayAlignmentErrorsPrompt());
    expect(store.getActions()).toEqual(expectedActions);
  });
});

