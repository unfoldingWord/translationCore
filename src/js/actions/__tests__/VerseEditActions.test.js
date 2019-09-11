import * as actions from '../VerseEditActions';
import types from '../ActionTypes';

describe('verse edit actions', () => {
  it('produces a resource update action', () => {
    const chapter = 1;
    const verse = 2;
    const text = 'hello world';
    const result = actions.updateTargetVerse(chapter, verse, text);

    expect(result).toEqual({
      type: types.UPDATE_TARGET_VERSE,
      editedText: text,
      chapter,
      verse,
    });
  });

  it('produces an edit action without a gateway language', () => {
    const before = 'before text';
    const after = 'after text';
    const tags = ['hello', 'world'];
    const username = 'me';
    const modified = (new Date()).toJSON();
    const book = 'book';
    const chapter = 1;
    const verse = 2;
    const activeChapter = 1;
    const activeVerse = 17;
    const quote = 'quote';
    const groupId = 'group';
    const occurrence = 1;

    const result = actions.recordTargetVerseEdit(book, chapter, verse, before, after, tags, username, modified, null, null,
      { reference: { chapter:activeChapter, verse: activeVerse } }, quote, groupId, occurrence);

    expect(result).toEqual({
      type: types.ADD_VERSE_EDIT,
      tags,
      before,
      after,
      username,
      activeBook: book,
      activeChapter,
      activeVerse,
      modifiedTimestamp: modified,
      gatewayLanguageCode: null,
      gatewayLanguageQuote: null,
      reference: {
        bookId: book,
        chapter,
        verse,
      },
    });
  });

  it('produces an edit action with a gateway language', () => {
    const before = 'before text';
    const after = 'after text';
    const tags = ['hello', 'world'];
    const username = 'me';
    const modified = (new Date()).toJSON();
    const glCode = 'code';
    const glQuote = 'quote';
    const book = 'book';
    const chapter = 1;
    const verse = 2;
    const activeChapter = 1;
    const activeVerse = 17;
    const quote = 'quote';
    const groupId = 'group';
    const occurrence = 1;

    const result = actions.recordTargetVerseEdit(book, chapter, verse, before, after, tags, username, modified, glCode, glQuote,
      { reference: { chapter:activeChapter, verse: activeVerse } }, quote, groupId, occurrence);

    expect(result).toEqual({
      type: types.ADD_VERSE_EDIT,
      tags,
      before,
      after,
      username,
      activeBook: book,
      activeChapter,
      activeVerse,
      modifiedTimestamp: modified,
      gatewayLanguageCode: glCode,
      gatewayLanguageQuote: glQuote,
      reference: {
        bookId: book,
        chapter,
        verse,
      },
    });
  });
});
