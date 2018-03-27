import types from '../../actions/ActionTypes';
import reducer, {getSaveStructure} from '../verseEditReducer';

describe('verse edit reducer',  () => {
  const timestamp = (new Date()).toJSON();

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      verseBefore: null,
      verseAfter: null,
      tags: null,
      userName: null,
      modifiedTimestamp: null,
      gatewayLanguageCode: null,
      gatewayLanguageQuote: null,
      reference: {
        bookId: null,
        chapter: null,
        verse: null
      }
    });
  });

  it('should handle ADD_VERSE_EDIT with empty data', () => {
    expect(
      reducer({}, {
        type: types.ADD_VERSE_EDIT,
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
          verse: 2
        }
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
        verse: 2
      }
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
        verse: 5
      }
    };

    expect(
      reducer(originalState, {
        type: types.ADD_VERSE_EDIT,
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
          verse: 2
        }
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
        verse: 2
      }
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
        verse: 2
      }
    };
    const saveState = getSaveStructure(state, 'wordAlignment');
    expect(saveState).toEqual({
      verseBefore: 'before text',
      verseAfter: 'after text',
      tags: ['hello', 'world'],
      userName: 'me',
      modifiedTimestamp: timestamp,
      gatewayLanguageCode: 'code',
      gatewayLanguageQuote: 'quote',
      contextId: {
        reference: {
          bookId: 'book',
          chapter: 1,
          verse: 2
        },
        tool: 'wordAlignment',
        groupId: 'chapter_1'
      }
    });
  });
});
