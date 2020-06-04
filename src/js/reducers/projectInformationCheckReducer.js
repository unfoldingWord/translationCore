import consts from '../actions/ActionTypes';

const InitialState = {
  bookId: '',
  resourceId: '',
  nickname: '',
  languageId: '',
  languageName: '',
  languageDirection: '',
  contributors: [],
  checkers: [],
  alreadyImported: false,
  usfmProject: false,
  localImport: false,
  overwritePermitted: false,
  skipProjectNameCheck: false,
  projectFont: 'default',
};

const projectInformationCheckReducer = (state = InitialState, action) => {
  switch (action.type) {
  case consts.SET_BOOK_ID_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      bookId: action.bookId,
    };
  case consts.SET_RESOURCE_ID_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      resourceId: action.resourceId,
    };
  case consts.SET_NICKNAME_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      nickname: action.nickname,
    };
  case consts.SET_LANGUAGE_ID_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      languageId: action.languageId,
    };
  case consts.SET_LANGUAGE_NAME_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      languageName: action.languageName,
    };
  case consts.SET_LANGUAGE_DIRECTION_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      languageDirection: action.languageDirection,
    };
  case consts.SET_ALL_LANGUAGE_INFO_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      languageId: action.languageId,
      languageName: action.languageName,
      languageDirection: action.languageDirection,
    };
  case consts.SET_CONTRIBUTORS_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      contributors: action.contributors,
    };
  case consts.SET_CHECKERS_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      checkers: action.checkers,
    };
  case consts.SET_ALREADY_IMPORTED_IN_PROJECT_INFORMATION_CHECK_REDUCER:
    return {
      ...state,
      alreadyImported: action.alreadyImported,
    };
  case consts.SET_USFM_PROJECT_IN_PROJECT_INFORMATION_CHECK_REDUCER:
    return {
      ...state,
      usfmProject: action.usfmProject,
    };
  case consts.SET_LOCAL_IMPORT_IN_PROJECT_INFORMATION_CHECK_REDUCER:
    return {
      ...state,
      localImport: action.localImport,
    };
  case consts.SET_OVERWRITE_PERMITTED_IN_PROJECT_INFORMATION_CHECK_REDUCER:
    return {
      ...state,
      overwritePermitted: action.overwritePermitted,
    };
  case consts.SET_SKIP_PROJECT_NAME_CHECK_IN_PROJECT_INFORMATION_CHECK_REDUCER:
    return {
      ...state,
      skipProjectNameCheck: action.skipProjectNameCheck,
    };
  case consts.SET_PROJECT_FONT_IN_PROJECT_INFORMATION_REDUCER:
    return {
      ...state,
      projectFont: action.projectFont,
    };
  case consts.CLEAR_PROJECT_INFORMATION_REDUCER:
    return InitialState;
  default:
    return state;
  }
};

export default projectInformationCheckReducer;

/**
 * checks to see if we selected a usfm project
 * @param state
 * @return {boolean}
 */
export const getIsUsfmProject = (state) =>
  state.usfmProject;

/**
 * checks to see if project overwrite is permitted
 * @param state
 * @return {boolean}
 */
export const getIsOverwritePermitted = (state) =>
  state.overwritePermitted;

/**
 * checks to see if we have already imported this project
 * @param state
 * @return {boolean}
 */
export const getIsProjectAlreadyImported = (state) =>
  state.alreadyImported;
