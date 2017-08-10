import consts from '../actions/ActionTypes';

const initialState = {
  selectedLicenseId: null,
  projectLicenseMarkdown: null
};

const copyrightCheckReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SELECT_PROJECT_LICENSE_ID:
      return {
        ...state,
        selectedLicenseId: action.selectedLicenseId
      }
    case consts.LOAD_PROJECT_LICENSE_MARKDOWN:
      return {
        ...state,
        projectLicenseMarkdown: action.projectLicenseMarkdown
      }
    default:
      return state;
  }
};

export default copyrightCheckReducer;
