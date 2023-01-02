import _ from 'lodash';
import { updateAlignedWordsFromOriginal } from '../js/helpers/migrationHelpers';

const newGreek_json = Object.freeze(require('./fixtures/migrateAlignments/sr_greek_tit_1.json'));
const alignments_json = Object.freeze(require('./fixtures/migrateAlignments/alignments_tit_1.json'));

const newGreek2_json = Object.freeze(require('./fixtures/migrateAlignments/sr_greek_tit_2.json'));
const alignments2_json = Object.freeze(require('./fixtures/migrateAlignments/alignments_tit_2.json'));

describe('update attributes of aligned words',()=> {
  test('punctuation changed in κατʼ', () => {
    const verse = 1;
    const titusAlignments = _.cloneDeep(alignments_json);
    updateAlignedWordsFromOriginal(newGreek_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('lemma changed for ἡμῶν', () => {
    const verse = 4;
    const titusAlignments = _.cloneDeep(alignments_json);
    updateAlignedWordsFromOriginal(newGreek_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Captitalization change', () => {
    const verse = 7;
    const titusAlignments = _.cloneDeep(alignments_json);
    updateAlignedWordsFromOriginal(newGreek_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Update words in word bank', () => {
    const verse = 2;
    const titusAlignments = _.cloneDeep(alignments2_json);
    updateAlignedWordsFromOriginal(newGreek2_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });


  test('fix broken strongs', () => {
    const verse = 5;
    const titusAlignments = _.cloneDeep(alignments2_json);
    updateAlignedWordsFromOriginal(newGreek2_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Drop extra word bank word', () => {
    const verse = 6;
    const titusAlignments = _.cloneDeep(alignments2_json);
    updateAlignedWordsFromOriginal(newGreek2_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Drop Extra Aligned word', () => {
    const verse = 9;
    const titusAlignments = _.cloneDeep(alignments2_json);
    updateAlignedWordsFromOriginal(newGreek2_json, titusAlignments, verse);
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toMatchSnapshot();
  });
});
