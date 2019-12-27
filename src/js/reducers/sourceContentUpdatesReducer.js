import consts from '../actions/ActionTypes';

const initialState = {
  resources: [],
  updateCount: 0, // to easily keep track of when content has been modified, faster than doing diff of all resources
};

const SourceContentUpdatesReducer = (state = initialState, action) => {
  switch (action.type) {
  case consts.NEW_LIST_OF_SOURCE_CONTENT_TO_UPDATE:
    return {
      ...state,
      resources: action.resources,
    };
  case consts.RESET_LIST_OF_SOURCE_CONTENT_TO_UPDATE:
    return {
      ...state,
      resources: [],
    };
  case consts.INCREMENT_SOURCE_CONTENT_UPDATE_COUNT:
    return {
      ...state,
      updateCount: state.updateCount + 1,
    };
  default:
    return state;
  }
};

export default SourceContentUpdatesReducer;

/**
 * Returns the list of resources that need to be updated.
 * @param {object} state the resources slice of the state object
 * @returns {object}
 */
export const getListOfOutdatedSourceContent = (state) =>
  state.resources;

/**
 * Returns the count of source content updates this session.  This can be used to see if dependencies on source content
 *  need to be updated by checking if count has changed.
 * @param {object} state the resources slice of the state object
 * @returns {Number} count of source content updates this session
 */
export const getSourceContentUpdateCount = (state) =>
  state.updateCount;
