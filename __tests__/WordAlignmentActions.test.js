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

describe('WordAlignmentActions.removeWordBankItemFromAlignments', () => {
  it('Test removeWordBankItemFromAlignments when word is in alignments', () => {
    let alignments = [{"topWords":[{"word":"μὴ","lemma":"μή","morph":"Gr,D,,,,,,,,,","occurrence":1,"occurrences":1,"strong":"G33610"}],"bottomWords":[{"word":"not","occurrence":1,"occurrences":1,"type":"bottomWord"}]},{"topWords":[{"word":"προσέχοντες","lemma":"προσέχω","morph":"Gr,VIPPA,NMP,","occurrence":1,"occurrences":1,"strong":"G43370"}],"bottomWords":[{"word":"any","occurrence":1,"occurrences":1,"type":"bottomWord"},{"word":"to","occurrence":1,"occurrences":2,"type":"bottomWord"}]},{"topWords":[{"word":"Ἰουδαϊκοῖς","lemma":"Ἰουδαϊκός","morph":"Gr,AA,,,,DMP,","occurrence":1,"occurrences":1,"strong":"G24510"}],"bottomWords":[]},{"topWords":[{"word":"μύθοις","lemma":"μῦθος","morph":"Gr,N,,,,,DMP,","occurrence":1,"occurrences":1,"strong":"G34540"}],"bottomWords":[]},{"topWords":[{"word":"καὶ","lemma":"καί","morph":"Gr,CC,,,,,,,,","occurrence":1,"occurrences":1,"strong":"G25320"}],"bottomWords":[]},{"topWords":[{"word":"ἐντολαῖς","lemma":"ἐντολή","morph":"Gr,N,,,,,DFP,","occurrence":1,"occurrences":1,"strong":"G17850"}],"bottomWords":[]},{"topWords":[{"word":"ἀνθρώπων","lemma":"ἄνθρωπος","morph":"Gr,N,,,,,GMP,","occurrence":1,"occurrences":1,"strong":"G04440"}],"bottomWords":[]},{"topWords":[{"word":"ἀποστρεφομένων","lemma":"ἀποστρέφω","morph":"Gr,VTPPM,GMP,","occurrence":1,"occurrences":1,"strong":"G06540"}],"bottomWords":[]},{"topWords":[{"word":"τὴν","lemma":"ὁ","morph":"Gr,EA,,,,AFS,","occurrence":1,"occurrences":1,"strong":"G35880"}],"bottomWords":[{"word":"of","occurrence":1,"occurrences":1,"type":"bottomWord"}]},{"topWords":[{"word":"ἀλήθειαν","lemma":"ἀλήθεια","morph":"Gr,N,,,,,AFS,","occurrence":1,"occurrences":1,"strong":"G02250"}],"bottomWords":[{"word":"commands","occurrence":1,"occurrences":1,"type":"bottomWord"}]}];
    let wordBankItem = {"word":"of","occurrence":1,"occurrences":1,"alignmentIndex":8,"type":"bottomWord"};
    const expectedAlignments = [{"topWords":[{"word":"μὴ","lemma":"μή","morph":"Gr,D,,,,,,,,,","occurrence":1,"occurrences":1,"strong":"G33610"}],"bottomWords":[{"word":"not","occurrence":1,"occurrences":1,"type":"bottomWord"}]},{"topWords":[{"word":"προσέχοντες","lemma":"προσέχω","morph":"Gr,VIPPA,NMP,","occurrence":1,"occurrences":1,"strong":"G43370"}],"bottomWords":[{"word":"any","occurrence":1,"occurrences":1,"type":"bottomWord"},{"word":"to","occurrence":1,"occurrences":2,"type":"bottomWord"}]},{"topWords":[{"word":"Ἰουδαϊκοῖς","lemma":"Ἰουδαϊκός","morph":"Gr,AA,,,,DMP,","occurrence":1,"occurrences":1,"strong":"G24510"}],"bottomWords":[]},{"topWords":[{"word":"μύθοις","lemma":"μῦθος","morph":"Gr,N,,,,,DMP,","occurrence":1,"occurrences":1,"strong":"G34540"}],"bottomWords":[]},{"topWords":[{"word":"καὶ","lemma":"καί","morph":"Gr,CC,,,,,,,,","occurrence":1,"occurrences":1,"strong":"G25320"}],"bottomWords":[]},{"topWords":[{"word":"ἐντολαῖς","lemma":"ἐντολή","morph":"Gr,N,,,,,DFP,","occurrence":1,"occurrences":1,"strong":"G17850"}],"bottomWords":[]},{"topWords":[{"word":"ἀνθρώπων","lemma":"ἄνθρωπος","morph":"Gr,N,,,,,GMP,","occurrence":1,"occurrences":1,"strong":"G04440"}],"bottomWords":[]},{"topWords":[{"word":"ἀποστρεφομένων","lemma":"ἀποστρέφω","morph":"Gr,VTPPM,GMP,","occurrence":1,"occurrences":1,"strong":"G06540"}],"bottomWords":[]},{"topWords":[{"word":"τὴν","lemma":"ὁ","morph":"Gr,EA,,,,AFS,","occurrence":1,"occurrences":1,"strong":"G35880"}],"bottomWords":[]},{"topWords":[{"word":"ἀλήθειαν","lemma":"ἀλήθεια","morph":"Gr,N,,,,,AFS,","occurrence":1,"occurrences":1,"strong":"G02250"}],"bottomWords":[{"word":"commands","occurrence":1,"occurrences":1,"type":"bottomWord"}]}]
    const newAlignments = WordAlignmentActions.removeWordBankItemFromAlignments(wordBankItem, alignments);
    expect(newAlignments).toEqual(expectedAlignments);
  });

  it('Test removeWordBankItemFromAlignments when word is not in alignments', () => {
    const alignments = [{"topWords":[{"word":"Θεὸν","lemma":"θεός","morph":"Gr,N,,,,,AMS,","occurrence":1,"occurrences":1,"strong":"G23160"}],"bottomWords":[]},{"topWords":[{"word":"ὁμολογοῦσιν","lemma":"ὁμολογέω","morph":"Gr,VTIPA3,,P,","occurrence":1,"occurrences":1,"strong":"G36700"}],"bottomWords":[]},{"topWords":[{"word":"εἰδέναι","lemma":"εἴδω","morph":"Gr,VTNEA,,,,,","occurrence":1,"occurrences":1,"strong":"G14920"}],"bottomWords":[]},{"topWords":[{"word":"τοῖς","lemma":"ὁ","morph":"Gr,EP,,,,DNP,","occurrence":1,"occurrences":1,"strong":"G35880"}],"bottomWords":[]},{"topWords":[{"word":"δὲ","lemma":"δέ","morph":"Gr,CC,,,,,,,,","occurrence":1,"occurrences":1,"strong":"G11610"}],"bottomWords":[]},{"topWords":[{"word":"ἔργοις","lemma":"ἔργον","morph":"Gr,N,,,,,DNP,","occurrence":1,"occurrences":1,"strong":"G20410"}],"bottomWords":[]},{"topWords":[{"word":"ἀρνοῦνται","lemma":"ἀρνέομαι","morph":"Gr,VIIPM3,,P,","occurrence":1,"occurrences":1,"strong":"G07200"}],"bottomWords":[]},{"topWords":[{"word":"βδελυκτοὶ","lemma":"βδελυκτός","morph":"Gr,NS,,,,NMP,","occurrence":1,"occurrences":1,"strong":"G09470"}],"bottomWords":[]},{"topWords":[{"word":"ὄντες","lemma":"εἰμί","morph":"Gr,VLPPA,NMP,","occurrence":1,"occurrences":1,"strong":"G15100"}],"bottomWords":[]},{"topWords":[{"word":"καὶ","lemma":"καί","morph":"Gr,CC,,,,,,,,","occurrence":1,"occurrences":2,"strong":"G25320"}],"bottomWords":[]},{"topWords":[{"word":"ἀπειθεῖς","lemma":"ἀπειθής","morph":"Gr,NS,,,,NMP,","occurrence":1,"occurrences":1,"strong":"G05450"}],"bottomWords":[]},{"topWords":[{"word":"καὶ","lemma":"καί","morph":"Gr,CC,,,,,,,,","occurrence":2,"occurrences":2,"strong":"G25320"}],"bottomWords":[]},{"topWords":[{"word":"πρὸς","lemma":"πρός","morph":"Gr,P,,,,,A,,,","occurrence":1,"occurrences":1,"strong":"G43140"}],"bottomWords":[]},{"topWords":[{"word":"πᾶν","lemma":"πᾶς","morph":"Gr,EQ,,,,ANS,","occurrence":1,"occurrences":1,"strong":"G39560"}],"bottomWords":[]},{"topWords":[{"word":"ἔργον","lemma":"ἔργον","morph":"Gr,N,,,,,ANS,","occurrence":1,"occurrences":1,"strong":"G20410"}],"bottomWords":[]},{"topWords":[{"word":"ἀγαθὸν","lemma":"ἀγαθός","morph":"Gr,AA,,,,ANS,","occurrence":1,"occurrences":1,"strong":"G00180"}],"bottomWords":[]},{"topWords":[{"word":"ἀδόκιμοι","lemma":"ἀδόκιμος","morph":"Gr,NS,,,,NMP,","occurrence":1,"occurrences":1,"strong":"G00960"}],"bottomWords":[]}];
    const wordBankItem = {"word":"they","occurrence":1,"occurrences":1,"type":"bottomWord"};
    const expectedAlignments = alignments;
    const newAlignments = WordAlignmentActions.removeWordBankItemFromAlignments(wordBankItem, alignments);
    expect(newAlignments).toEqual(expectedAlignments);
  });
});
