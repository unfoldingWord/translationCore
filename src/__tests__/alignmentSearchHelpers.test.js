import path from 'path-extra';
import {
  buildSearchRegex,
  getCount,
  loadAlignments,
  multiSearchAlignments,
  regexSearch,
  searchAlignments,
} from '../js/helpers/alignmentSearchHelpers';

jest.unmock('fs-extra');

describe('test greek alignments', () => {
  const fileName = 'es-419_glt_Es-419%5Fgl_el-x-koine_testament_v39%2E1_501';
  const jsonPath = path.join(__dirname, `fixtures/alignmentData/${fileName}.json`);
  const alignmentData = loadAlignments(jsonPath);
  const {
    alignments,
    target,
    lemma,
    source,
  } = alignmentData;

  it('verify Greek alignment search data', () => {
    // given
    const expectedCount = 501;

    // when

    // then
    expect(alignments).toBeTruthy();
    expect(Object.keys(alignments).length).toEqual(expectedCount);
    const sourceAlignmentsCount = getCount(source.alignments);
    const targetAlignmentsCount = getCount(target.alignments);
    const lemmaAlignmentsCount = getCount(lemma.alignments);
    expect(targetAlignmentsCount).toEqual(expectedCount);
    expect(sourceAlignmentsCount).toEqual(expectedCount);
    expect(lemmaAlignmentsCount).toEqual(expectedCount);
  });

  describe('test multiSearchAlignments', () => {
    it('search partial Pab', () => { // Pablo
      // given
      const search = 'Pab';
      const config = {
        fullWord: false,
        caseInsensitive: false,
        searchLemma: true,
        searchSource: true,
        searchTarget: true,
      };

      // when
      const found = multiSearchAlignments(alignmentData, search, config);

      // then
      expect(found.length).toEqual(1);
    });

    it('search full κατὰ', () => {
      // given
      const search = 'κατὰ';
      const config = {
        fullWord: true,
        caseInsensitive: false,
        searchLemma: true,
        searchSource: true,
        searchTarget: true,
      };

      // when
      const found = multiSearchAlignments(alignmentData, search, config);

      // then
      expect(found.length).toEqual(4);
    });

    it('search full κατά', () => {
      // given
      const search = 'κατά';
      const config = {
        fullWord: true,
        caseInsensitive: false,
        searchLemma: true,
        searchSource: true,
        searchTarget: true,
      };

      // when
      const found = multiSearchAlignments(alignmentData, search, config);

      // then
      expect(found.length).toEqual(7);
    });

    it('search lemma full κατ*', () => {
      // given
      const search = 'κατ*';
      const config = {
        fullWord: true,
        caseInsensitive: false,
        searchLemma: true,
        searchSource: false,
        searchTarget: false,
      };

      // when
      const found = multiSearchAlignments(alignmentData, search, config);

      // then
      expect(found.length).toEqual(9);
    });

    it('search source full κατ*', () => {
      // given
      const search = 'κατ*';
      const config = {
        fullWord: true,
        caseInsensitive: false,
        searchLemma: false,
        searchSource: true,
        searchTarget: false,
      };

      // when
      const found = multiSearchAlignments(alignmentData, search, config);

      // then
      expect(found.length).toEqual(10);
    });

    it('search all full κατ*', () => {
      // given
      const search = 'κατ*';
      const config = {
        fullWord: true,
        caseInsensitive: false,
        searchLemma: true,
        searchSource: true,
        searchTarget: true,
      };

      // when
      const found = multiSearchAlignments(alignmentData, search, config);

      // then
      expect(found.length).toEqual(10);
    });
  });

  describe('test searchAlignments', () => {
    it('search text Pab', () => {
      // given
      const search = 'Pab';
      const fullWord = false;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex partial Pab false', () => {
      // given
      const search = 'Pab';
      const fullWord = true;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(0);
    });

    it('search regex partial word Pab true', () => {
      // given
      const search = 'Pab';
      const fullWord = false;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word Pablo true', () => {
      // given
      const search = 'Pablo';
      const fullWord = true;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word pablo case insensitive true', () => {
      // given
      const search = 'pablo';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word p?blo case insensitive true', () => {
      // given
      const search = 'p?blo';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word pa*o case insensitive true', () => {
      // given
      const search = 'pa*o';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word jes* case insensitive true', () => {
      // given
      const search = 'jes*';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(3);
    });

    it('search regex partial word κατ case insensitive true', () => {
      // given
      const search = 'κατ';
      const fullWord = false;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, source.keys, source.alignments);

      // then
      expect(foundAlignments.length).toEqual(12);
    });

    it('search regex full word κατὰ case insensitive true', () => {
      // given
      const search = 'Κατὰ';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, source.keys, source.alignments);

      // then
      expect(foundAlignments.length).toEqual(4);
    });
  });

  describe('test regexSearch', () => {
    it('search text Pab', () => {
      // given
      const search = 'Pab';

      // when
      const found = regexSearch(target.keys, search);

      // then
      expect(found.length).toEqual(1);
    });

    it('search greek text κατὰ case', () => {
      // given
      const search = 'κατ';

      // when
      const found = regexSearch(source.keys, search);

      // then
      expect(found.length).toEqual(7);
    });

    it('search regex partial Pab false', () => {
      // given
      const search_ = 'Pab';
      const fullWord = true;
      const caseInsensitive = false;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(0);
    });

    it('search regex partial word Pab true', () => {
      // given
      const search_ = 'Pab';
      const fullWord = false;
      const caseInsensitive = false;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word Pablo true', () => {
      // given
      const search_ = 'Pablo';
      const fullWord = true;
      const caseInsensitive = false;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word pablo case insensitive true', () => {
      // given
      const search_ = 'pablo';
      const fullWord = true;
      const caseInsensitive = true;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word p?blo case insensitive true', () => {
      // given
      const search_ = 'p?blo';
      const fullWord = true;
      const caseInsensitive = true;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word pa*o case insensitive true', () => {
      // given
      const search_ = 'pa*o';
      const fullWord = true;
      const caseInsensitive = true;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word jes* case insensitive true', () => {
      // given
      const search_ = 'jes*';
      const fullWord = true;
      const caseInsensitive = true;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(3);
    });
  });
});

// helpers

