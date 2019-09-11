import types from '../../actions/ActionTypes';
import reducer from '../resourcesReducer';

describe('resources reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      bibles: {},
      translationHelps: {},
      lexicons: {},
    });
  });

  it('should handle ADD_NEW_BIBLE_TO_RESOURCES', () => {
    const startBefore = { bibles: {} };
    const action = {
      type: types.ADD_NEW_BIBLE_TO_RESOURCES,
      languageId: 'en',
      bibleId: 'ulb',
      bibleData: { hello: 'world' },
    };
    const stateAfter = { bibles: { en: { ulb: { hello: 'world' } } } };
    expect(reducer(startBefore, action)).toEqual(stateAfter);
  });

  it('should handle UPDATE_TARGET_VERSE', () => {
    const startBefore = { bibles: { targetLanguage: { targetBible: { '1': { '1': 'hello world' } } } } };
    const action = {
      type: types.UPDATE_TARGET_VERSE,
      chapter: 1,
      verse: 1,
      editedText: 'changed!',
    };
    const stateAfter = { bibles: { targetLanguage: { targetBible: { '1': { '1': 'changed!' } } } } };
    expect(reducer(startBefore, action)).toEqual(stateAfter);
  });

  it('should handle ADD_TRANSLATIONHELPS_ARTICLE', () => {
    const startBefore = { translationHelps: {} };
    const action = {
      type: types.ADD_TRANSLATIONHELPS_ARTICLE,
      resourceType: 'res',
      articleId: 'art',
      articleData: 'data',
    };
    const stateAfter = { translationHelps: { res: { art: 'data' } } };
    expect(reducer(startBefore, action)).toEqual(stateAfter);
  });

  it('should handle ADD_LEXICON_ENTRY', () => {
    const startBefore = { lexicons: {} };
    const action = {
      type: types.ADD_LEXICON_ENTRY,
      lexiconId: 'lex',
      entryId: 'id',
      entryData: 'data',
    };
    const stateAfter = { lexicons: { lex: { id: 'data' } } };
    expect(reducer(startBefore, action)).toEqual(stateAfter);
  });

  it('should handle CLEAR_RESOURCES_REDUCER', () => {
    const startBefore = { hello: 'world' };
    const action = { type: types.CLEAR_RESOURCES_REDUCER };
    const stateAfter = {
      bibles: {},
      translationHelps: {},
      lexicons: {},
    };
    expect(reducer(startBefore, action)).toEqual(stateAfter);
  });
});
