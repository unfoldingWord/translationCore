import types from '../../actions/ActionTypes';
import reducer, { getSaveStructure } from '../verseEditReducer';
import { WORD_ALIGNMENT } from '../../common/constants';

describe('verse edit reducer', () => {
  const timestamp = (new Date()).toJSON();

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      activeBook: null,
      activeChapter: null,
      activeVerse: null,
      gatewayLanguageCode: null,
      gatewayLanguageQuote: null,
      modifiedTimestamp: null,
      occurrence: null, quote: null,
      reference: {
        bookId: null,
        chapter: null,
        groupId: null,
        verse: null,
      },
      tags: null,
      userName: null,
      verseAfter: null,
      verseBefore: null,
    });
  });


  it('should handle ADD_VERSE_EDIT with empty data', () => {
    expect(
      reducer({}, {
        type: types.ADD_VERSE_EDIT,
        before: 'before text',
        after: 'after text',
        tags: ['hello', 'world'],
        username: 'me',
        modifiedTimestamp: timestamp,
        gatewayLanguageCode: 'code',
        gatewayLanguageQuote: 'quote',
        reference: {
          bookId: 'book',
          chapter: 1,
          verse: 2,
        },
      })
    ).toEqual({
      verseBefore: 'before text',
      verseAfter: 'after text',
      tags: ['hello', 'world'],
      userName: 'me',
      modifiedTimestamp: timestamp,
      gatewayLanguageCode: 'code',
      gatewayLanguageQuote: 'quote',
      reference: {
        bookId: 'book',
        chapter: 1,
        verse: 2,
      },
    });
  });

  it('should handle ADD_VERSE_EDIT with pre-existing data', () => {
    const originalState = {
      verseBefore: 'original before text',
      verseAfter: 'original after text',
      tags: ['foo', 'bar'],
      userName: 'you',
      modifiedTimestamp: timestamp,
      gatewayLanguageCode: 'c',
      gatewayLanguageQuote: 'q',
      reference: {
        bookId: 'original book',
        chapter: 4,
        verse: 5,
      },
    };

    expect(
      reducer(originalState, {
        type: types.ADD_VERSE_EDIT,
        before: 'before text',
        after: 'after text',
        tags: ['hello', 'world'],
        username: 'me',
        modifiedTimestamp: timestamp,
        gatewayLanguageCode: 'code',
        gatewayLanguageQuote: 'quote',
        reference: {
          bookId: 'book',
          chapter: 1,
          verse: 2,
        },
      })
    ).toEqual({
      verseBefore: 'before text',
      verseAfter: 'after text',
      tags: ['hello', 'world'],
      userName: 'me',
      modifiedTimestamp: timestamp,
      gatewayLanguageCode: 'code',
      gatewayLanguageQuote: 'quote',
      reference: {
        bookId: 'book',
        chapter: 1,
        verse: 2,
      },
    });
  });
});

describe('verse edit selectors', () => {
  it('should return the state formatted for saving', () => {
    const timestamp = (new Date()).toJSON();
    const state = {
      verseBefore: 'before text',
      verseAfter: 'after text',
      tags: ['hello', 'world'],
      userName: 'me',
      modifiedTimestamp: timestamp,
      gatewayLanguageCode: 'code',
      gatewayLanguageQuote: 'quote',
      reference: {
        bookId: 'book',
        chapter: 1,
        verse: 2,
        groupId:'group',
      },
      quote:'quote',
      occurrence: 1,
    };
    const saveState = getSaveStructure(state, WORD_ALIGNMENT);

    expect(saveState).toEqual({
      verseBefore: 'before text',
      verseAfter: 'after text',
      tags: ['hello', 'world'],
      userName: 'me',
      modifiedTimestamp: timestamp,
      gatewayLanguageCode: 'code',
      gatewayLanguageQuote: 'quote',
      occurrence: 1,
      quote: 'quote',
      contextId: {
        reference: {
          bookId: 'book',
          chapter: 1,
          verse: 2,
          groupId: 'group',
        },
        occurrence: 1,
        quote: 'quote',
        tool: WORD_ALIGNMENT,
        groupId: 'group',
      },
    });
  });
});
