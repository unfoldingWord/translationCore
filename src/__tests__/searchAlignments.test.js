import path from 'path-extra';
import {
  buildSearchRegex,
  getCount,
  loadAlignments,
  multiSearchAlignments,
  regexSearch,
  searchAlignments,
} from '../js/helpers/searchHelper';

jest.unmock('fs-extra');

describe('test greek alignments', () => {
  const fileName = 'en_test_el-x-koine';
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

    // when

    // then
    expect(alignments).toBeTruthy();
    expect(Object.keys(alignments).length).toEqual(418);
    const sourceAlignmentsCount = getCount(source.alignments);
    const targetAlignmentsCount = getCount(target.alignments);
    const lemmaAlignmentsCount = getCount(lemma.alignments);
    expect(sourceAlignmentsCount).toEqual(targetAlignmentsCount);
    expect(lemmaAlignmentsCount).toEqual(targetAlignmentsCount);
  });

  describe('test multiSearchAlignments', () => {
    it('search partial Pau ', () => {
      // given
      const search = 'Pau';
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
      expect(found.length).toEqual(5);
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
      expect(found.length).toEqual(8);
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
      expect(found.length).toEqual(10);
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
      expect(found.length).toEqual(11);
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
      expect(found.length).toEqual(11);
    });
  });

  describe('test searchAlignments', () => {
    it('search text', () => {
      // given
      const search = 'Pau';
      const fullWord = false;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex partial Pau false', () => {
      // given
      const search = 'Pau';
      const fullWord = true;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(0);
    });

    it('search regex partial word Pau true', () => {
      // given
      const search = 'Pau';
      const fullWord = false;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word Paul true', () => {
      // given
      const search = 'Paul';
      const fullWord = true;
      const caseInsensitive = false;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word paul case insensitive true', () => {
      // given
      const search = 'paul';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word p?ul case insensitive true', () => {
      // given
      const search = 'p?ul';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, target.keys, target.alignments);

      // then
      expect(foundAlignments.length).toEqual(1);
    });

    it('search regex full word p*l case insensitive true', () => {
      // given
      const search = 'p*l';
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
      expect(foundAlignments.length).toEqual(2);
    });

    it('search regex partial word κατ case insensitive true', () => {
      // given
      const search = 'κατ';
      const fullWord = false;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, source.keys, source.alignments);

      // then
      expect(foundAlignments.length).toEqual(13);
    });

    it('search regex full word κατὰ case insensitive true', () => {
      // given
      const search = 'Κατὰ';
      const fullWord = true;
      const caseInsensitive = true;

      // when
      const foundAlignments = searchAlignments(search, fullWord, caseInsensitive, source.keys, source.alignments);

      // then
      expect(foundAlignments.length).toEqual(5);
    });
  });

  describe('test regexSearch', () => {
    it('search text', () => {
      // given
      const search = 'Pau';

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

    it('search regex partial Pau false', () => {
      // given
      const search_ = 'Pau';
      const fullWord = true;
      const caseInsensitive = false;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(0);
    });

    it('search regex partial word Pau true', () => {
      // given
      const search_ = 'Pau';
      const fullWord = false;
      const caseInsensitive = false;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word Paul true', () => {
      // given
      const search_ = 'Paul';
      const fullWord = true;
      const caseInsensitive = false;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word paul case insensitive true', () => {
      // given
      const search_ = 'paul';
      const fullWord = true;
      const caseInsensitive = true;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word p?ul case insensitive true', () => {
      // given
      const search_ = 'p?ul';
      const fullWord = true;
      const caseInsensitive = true;
      const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);

      // when
      const found = regexSearch(target.keys, search, flags);

      // then
      expect(found.length).toEqual(1);
    });

    it('search regex full word p*l case insensitive true', () => {
      // given
      const search_ = 'p*l';
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
      expect(found.length).toEqual(2);
    });
  });
});

// helpers

