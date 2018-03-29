import consts from '../actions/ActionTypes';

const initialState = {
  alignmentData: {}
};

const wordAlignmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.UPDATE_ALIGNMENT_DATA:
      return {
        ...state,
        alignmentData: action.alignmentData
      };
    case consts.CLEAR_ALIGNMENT_DATA:
      return initialState;
    default:
      return state;
  }
};

export default wordAlignmentReducer;

/**
 * Returns an array of alignments for the verse
 * @param {object} state - the state slice
 * @param {int} chapter
 * @param {int} verse
 * @return {*}
 */
export const getVerseAlignments = (state, chapter, verse) => {
  const cKey = chapter.toString();
  const vKey = verse.toString();
  const {alignmentData} = state;
  if(alignmentData
    && alignmentData[cKey]
    && alignmentData[cKey][vKey]
    && alignmentData[cKey][vKey].alignments) {
    return alignmentData[cKey][vKey].alignments;
  } else {
    return [];
  }
};

/**
 * Returns an array of just those alignments in the verse that are populated
 * @param {object} state - the state slice
 * @param {int} chapter
 * @param {int} verse
 */
export const getPopulatedVerseAlignments = (state, chapter, verse) => {
  const populatedAlignments = [];
  const alignments = getVerseAlignments(state, chapter, verse);
  for(const a of alignments) {
    if(a.bottomWords && a.bottomWords.length) {
      populatedAlignments.push(a);
    }
  }
  return populatedAlignments;
};
