import _ from 'lodash';
import isEqual from 'deep-equal';
import {
  getLatestOriginalLanguageResource,
  getProjectAlignments,
  hasOriginalLanguageChanged,
  hasOriginalLanguageChangedSub,
  updateAlignedWordsFromOriginalForChapter,
  updateAlignedWordsFromOriginalForVerse,
  updateAlignedWordsFromOrigLanguage,
} from '../js/helpers/migrateOriginalLanguageHelpers';
import { CN_ORIG_LANG_OWNER, DEFAULT_ORIG_LANG_OWNER } from '../js/common/constants';

jest.unmock('fs-extra');

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
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('lemma changed for ἡμῶν', () => {
    const verse = 4;
    const titusAlignments = _.cloneDeep(alignments_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Captitalization change', () => {
    const verse = 7;
    const titusAlignments = _.cloneDeep(alignments_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Update words in word bank', () => {
    const verse = 2;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });


  test('fix broken strongs', () => {
    const verse = 5;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Drop extra word bank word', () => {
    const verse = 6;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Drop Extra Aligned word', () => {
    const verse = 9;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).not.toEqual(alignmentsWordListInitial);
    // expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
    expect(alignmentsWordList).toMatchSnapshot();
  });

  test('Invalid Verse num', () => {
    const verse = 0;
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse front', () => {
    const verse = 'front';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse random', () => {
    const verse = 'random';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse span front-after', () => {
    const verse = 'front-after';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse span 15-17', () => {
    const verse = '15-17';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Invalid Verse span 9,10', () => {
    const verse = '9,10';
    const titusAlignments = _.cloneDeep(alignments2_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek2_json, titusAlignments, verse);
    expect(changed).toBeFalsy();
    const alignmentsWordListInitial = alignments2_json[verse];
    const alignmentsWordList = titusAlignments[verse];
    expect(alignmentsWordList).toEqual(alignmentsWordListInitial);
  });

  test('Handle Verse Span', () => {
    const verse = '11-13';
    const titusAlignments = _.cloneDeep(alignments3_json);
    const changed = updateAlignedWordsFromOriginalForVerse(newGreek3_json, titusAlignments, verse);
    expect(changed).toBeTruthy();
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
    const expectedAttributesChanged = [ '11-13' ];
    const titusAlignments = _.cloneDeep(alignments3_json);
    const changedVerses = updateAlignedWordsFromOriginalForChapter(newGreek3_json, titusAlignments);
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
    expect(changedVerses.sort()).toEqual(expectedAttributesChanged.sort());
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
    const expectedAttributesChanged = [ '11-13' ];
    let titusAlignments = _.cloneDeep(alignments3_json);
    delete titusAlignments[deleteVerse];
    const changedVerses = updateAlignedWordsFromOriginalForChapter(newGreek3_json, titusAlignments);
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
    expect(changedVerses.sort()).toEqual(expectedAttributesChanged.sort());
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
    const expectedAttributesChanged = [ '11-13' ];
    const titusAlignments = _.cloneDeep(alignments3_json);
    const newGreek_json = _.cloneDeep(newGreek3_json);
    delete newGreek_json[deleteVerse];
    const changedVerses = updateAlignedWordsFromOriginalForChapter(newGreek_json, titusAlignments);
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
    expect(changedVerses.sort()).toEqual(expectedAttributesChanged.sort());
  });
});

describe('check for changed original language versions',()=> {
  test('test same wa version', () => {
    const latestVersion = '0.30';
    const projectVersion = latestVersion;
    const changed = false;
    const waOwner = 'Door43-Catalog';
    const projectManifest = {
      toolsSelectedOwners: { wordAlignment: waOwner },
      tc_orig_lang_wordAlignment: projectVersion,
    };
    const latestOrigLangManifest = { version: latestVersion };
    const expectedResults = {
      changed,
      owner: waOwner,
      version: projectVersion,
      latestVersion,
      latestOrigLangManifest,
      projectManifest,
    };
    const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
    expect(results).toEqual(expectedResults);
  });

  test('test missing wa owner', () => {
    const latestVersion = '0.30';
    const projectVersion = latestVersion;
    const changed = false;
    const projectManifest = { tc_orig_lang_wordAlignment: projectVersion };
    const latestOrigLangManifest = { version: latestVersion };
    const expectedResults = {
      changed,
      owner: DEFAULT_ORIG_LANG_OWNER,
      version: projectVersion,
      latestVersion,
      latestOrigLangManifest,
      projectManifest,
    };
    const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
    expect(results).toEqual(expectedResults);
  });

  test('test missing wa version', () => {
    const latestVersion = '0.30';
    const changed = true;
    const waOwner = 'Door43-Catalog';
    const projectManifest = { toolsSelectedOwners: { wordAlignment: waOwner } };
    const latestOrigLangManifest = { version: latestVersion };
    const expectedResults = {
      changed,
      owner: waOwner,
      version: null,
      latestVersion,
      latestOrigLangManifest,
      projectManifest,
    };
    const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
    expect(results).toEqual(expectedResults);
  });

  test('test missing original language resource', () => {
    const latestVersion = null;
    const projectVersion = '0.30';
    const changed = false;
    const waOwner = 'Door43-Catalog';
    const projectManifest = {
      toolsSelectedOwners: { wordAlignment: waOwner },
      tc_orig_lang_wordAlignment: projectVersion,
    };
    const latestOrigLangManifest = null;
    const expectedResults = {
      changed,
      owner: waOwner,
      version: projectVersion,
      latestVersion,
      latestOrigLangManifest,
      projectManifest,
    };
    const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
    expect(results).toEqual(expectedResults);
  });

  test('test missing project manifest', () => {
    const latestVersion = '0.30';
    const projectVersion = null;
    const changed = false;
    const waOwner = DEFAULT_ORIG_LANG_OWNER;
    const projectManifest = null;
    const latestOrigLangManifest = { version: latestVersion };
    const expectedResults = {
      changed,
      owner: waOwner,
      version: projectVersion,
      latestVersion,
      latestOrigLangManifest,
      projectManifest,
    };
    const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
    expect(results).toEqual(expectedResults);
  });

  test('test other owner', () => {
    const latestVersion = '0.30';
    const projectVersion = latestVersion;
    const changed = false;
    const waOwner = 'other';
    const projectManifest = {
      toolsSelectedOwners: { wordAlignment: waOwner },
      tc_orig_lang_wordAlignment: projectVersion,
    };
    const latestOrigLangManifest = { version: latestVersion };
    const expectedResults = {
      changed,
      owner: CN_ORIG_LANG_OWNER,
      version: projectVersion,
      latestVersion,
      latestOrigLangManifest,
      projectManifest,
    };
    const results = hasOriginalLanguageChangedSub(projectManifest, latestOrigLangManifest);
    expect(results).toEqual(expectedResults);
  });
});

describe.skip('update project Alignments',()=> {
  test('Has project changed', () => {
    const bookId = 'tit';
    const projectPath = '/Users/blm/translationCore/projects/en_ultx_tit_book';
    const resourcesPath = `/Users/blm/translationCore/resources`;
    const results = hasOriginalLanguageChanged(projectPath, bookId, resourcesPath);
    expect(results.changed).toBeTruthy();
  });

  test('Get Latest Original Resources and alignments', () => {
    const bookId = 'tit';
    const projectPath = '/Users/blm/translationCore/projects/en_ultx_tit_book';
    const resourcesPath = `/Users/blm/translationCore/resources`;
    const results = hasOriginalLanguageChanged(projectPath, bookId, resourcesPath);
    const origBook = getLatestOriginalLanguageResource(bookId, results.owner, resourcesPath);
    const alignments = getProjectAlignments(bookId, projectPath);
    expect(Object.keys(alignments)).toEqual(Object.keys(origBook));
    expect(Object.keys(origBook).length).toEqual(3);
  });

  test('Update alignments', () => {
    const bookId = 'tit';
    const projectPath = '/Users/blm/translationCore/projects/en_ultx_tit_book';
    const resourcesPath = `/Users/blm/translationCore/resources`;
    const chapterChanges = updateAlignedWordsFromOrigLanguage(projectPath, bookId, resourcesPath);
    expect(Object.keys(chapterChanges).length).toEqual(3);
  });
});
