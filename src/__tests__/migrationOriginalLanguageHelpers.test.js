import _ from 'lodash';
import isEqual from 'deep-equal';
import {
  updateAlignedWordsFromOriginalForChapter,
  updateAlignedWordsFromOriginalForVerse,
} from '../js/helpers/migrateOriginalLanguageHelpers';

const newGreek_json = Object.freeze(require('./fixtures/migrateAlignments/sr_greek_tit_1.json'));
const alignments_json = Object.freeze(require('./fixtures/migrateAlignments/alignments_tit_1.json'));

const newGreek2_json = Object.freeze(require('./fixtures/migrateAlignments/sr_greek_tit_2.json'));
const alignments2_json = Object.freeze(require('./fixtures/migrateAlignments/alignments_tit_2.json'));

const newGreek3_json = Object.freeze(require('./fixtures/migrateAlignments/ugnt_greek_gal_2.json'));
const alignments3_json = Object.freeze(require('./fixtures/migrateAlignments/alignments_gal_2.json'));

describe('update attributes of aligned words',()=> {
  test('punctuation changed in κατʼ', () => {
    const verse = 1;
    const titusAlignments = _.cloneDeep(alignments_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('lemma changed for ἡμῶν', () => {
    const verse = 4;
    const titusAlignments = _.cloneDeep(alignments_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Captitalization change', () => {
    const verse = 7;
    const titusAlignments = _.cloneDeep(alignments_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Update words in word bank', () => {
    const verse = 2;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });


  test('fix broken strongs', () => {
    const verse = 5;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Drop extra word bank word', () => {
    const verse = 6;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Drop Extra Aligned word', () => {
    const verse = 9;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Invalid Verse num', () => {
    const verse = 0;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse front', () => {
    const verse = 'front';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse random', () => {
    const verse = 'random';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse span front-after', () => {
    const verse = 'front-after';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse span 15-17', () => {
    const verse = '15-17';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse span 9,10', () => {
    const verse = '9,10';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(success).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Handle Verse Span', () => {
    const verse = '11-13';
    const titusAlignments = _.cloneDeep(alignments3_json);
    const success = updateAlignedWordsFromOriginalForVerse(newGreek3_json, titusAlignments, verse);
    expect(success).toBeTruthy();
    const alignmentsWordListInitial = alignments3_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });
});

describe('update attributes of aligned words for whole chapter',()=> {
  test('Update Entire Chapter', () => {
    const expectedChanged = [
      '2',
      '6',
      '9',
      '11-13',
      '14',
      '15',
      '16',
      '18',
      '19',
      '20',
      '21',
    ];
    const titusAlignments = _.cloneDeep(alignments3_json);
    updateAlignedWordsFromOriginalForChapter(newGreek3_json, titusAlignments);
    const verses = Object.keys(titusAlignments);
    const changed = [];

    for (const verse of verses) {
      const alignmentsWordListInitial = alignments3_json[verse];
      const alignmentsWordList = titusAlignments[verse];
      const unchanged = isEqual(alignmentsWordList, alignmentsWordListInitial);

      if (!unchanged) {
        changed.push(verse);
      }
    }
    expect(changed.sort()).toEqual(expectedChanged.sort());
  });

  test('Handle missing aligned verse', () => {
    const deleteVerse = '14';
    const expectedChanged = [
      '2',
      '6',
      '9',
      '11-13',
      '15',
      '16',
      '18',
      '19',
      '20',
      '21',
    ];
    let titusAlignments = _.cloneDeep(alignments3_json);
    delete titusAlignments[deleteVerse];
    updateAlignedWordsFromOriginalForChapter(newGreek3_json, titusAlignments);
    const verses = Object.keys(titusAlignments);
    const changed = [];

    for (const verse of verses) {
      const alignmentsWordListInitial = alignments3_json[verse];
      const alignmentsWordList = titusAlignments[verse];
      const unchanged = isEqual(alignmentsWordList, alignmentsWordListInitial);

      if (!unchanged) {
        changed.push(verse);
      }
    }
    expect(changed.sort()).toEqual(expectedChanged.sort());
  });

  test('Handle missing original verse', () => {
    const deleteVerse = '14';
    const expectedChanged = [
      '2',
      '6',
      '9',
      '11-13',
      '15',
      '16',
      '18',
      '19',
      '20',
      '21',
    ];
    const titusAlignments = _.cloneDeep(alignments3_json);
    const newGreek_json = _.cloneDeep(newGreek3_json);
    delete newGreek_json[deleteVerse];
    updateAlignedWordsFromOriginalForChapter(newGreek_json, titusAlignments);
    const verses = Object.keys(titusAlignments);
    const changed = [];

    for (const verse of verses) {
      const alignmentsWordListInitial = alignments3_json[verse];
      const alignmentsWordList = titusAlignments[verse];
      const unchanged = isEqual(alignmentsWordList, alignmentsWordListInitial);

      if (!unchanged) {
        changed.push(verse);
      }
    }
    expect(changed.sort()).toEqual(expectedChanged.sort());
  });
});
