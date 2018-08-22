import consts from '../actions/ActionTypes';

const initialState = {
  resources: [],
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
    default:
      return state;
  }
};

export default SourceContentUpdatesReducer;

/**
 * Returns the list of resources that need to be updated.
 * @param {object} state the resources slice of the state object
 */
export const getListOfOutdatedSourceContent = (state) =>
  state.resources;
