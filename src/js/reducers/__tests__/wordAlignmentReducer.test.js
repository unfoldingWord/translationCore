import types from '../../actions/ActionTypes';
import reducer, {getVerseAlignments, getPopulatedVerseAlignments} from '../wordAlignmentReducer';

describe('word alignment reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      alignmentData: {}
    });
  });

  it('should handle UPDATE_ALIGNMENT_DATA', () => {
    expect(reducer({}, {
      type: types.UPDATE_ALIGNMENT_DATA,
      alignmentData: {
        hello: 'world'
      }
    })).toEqual({
      alignmentData: {
        hello: 'world'
      }
    });
  });

  it('should handle CLEAR_ALIGNMENT_DATA', () => {
    const state = {
      alignmentData: {
        hello: 'world'
      }
    };
    expect(reducer(state, {
      type: types.CLEAR_ALIGNMENT_DATA
    })).toEqual({
      alignmentData: {}
    });
  });
});

describe('selectors', () => {
  it('should return alignments for a verse', () => {
    const state = {
      alignmentData: {
        '1': {
          '1' : {
            alignments: [
              {bottomWords: ['hi']},
              {bottomWords: []},
              {}
            ]
          }
        }
      }
    };
    const alignments = getVerseAlignments(state, 1, 1);
    expect(alignments).toEqual([
      {bottomWords: ['hi']},
      {bottomWords: []},
      {}
    ]);

    expect(getVerseAlignments({}, 1, 1)).toEqual([]);
  });

  it('should return populated alignments for a verse', () => {
    const state = {
      alignmentData: {
        '1': {
          '1' : {
            alignments: [
              {bottomWords: ['hi']},
              {bottomWords: []},
              {}
            ]
          }
        }
      }
    };
    const alignments = getPopulatedVerseAlignments(state, 1, 1);
    expect(alignments).toEqual([
      {bottomWords: ['hi']},
    ]);
  });
});
