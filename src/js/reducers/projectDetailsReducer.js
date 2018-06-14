import consts from '../actions/ActionTypes';

const initialState = {
  projectSaveLocation: '',
  manifest: {
    project: {},
    resource: {}
  },
  currentProjectToolsProgress: {},
  currentProjectToolsSelectedGL: {},
  projectType: null
};

const projectDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_SAVE_PATH_LOCATION:
      return {
        ...state,
        projectSaveLocation: action.pathLocation
      };
    case consts.STORE_MANIFEST:
      return {
        ...state,
        manifest: action.manifest
      };
    case consts.SET_PROJECT_PROGRESS_FOR_TOOL:
      return {
        ...state,
        currentProjectToolsProgress: {
          ...state.currentProjectToolsProgress,
          [action.toolName]: action.progress
        }
      };
    case consts.SET_GL_FOR_TOOL:
      return {
        ...state,
        currentProjectToolsSelectedGL: {
          ...state.currentProjectToolsSelectedGL,
          [action.toolName]: action.selectedGL
        }
      };
    case consts.ADD_MANIFEST_PROPERTY:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          [action.propertyName]: action.value
        }
      };
    case consts.SAVE_BOOK_ID_AND_BOOK_NAME_IN_MANIFEST:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          project: {
            ...state.manifest.project,
            id: action.bookId,
            name: action.bookName
          }
        }
      };
    case consts.SAVE_RESOURCE_ID_IN_MANIFEST:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          resource: {
            ...state.manifest.resource,
            id: action.resourceId
          }
        }
      };
    case consts.SAVE_NICKNAME_IN_MANIFEST:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          resource: {
            ...state.manifest.resource,
            name: action.nickname
          }
        }
      };
    case consts.SAVE_LANGUAGE_DETAILS_IN_MANIFEST:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          target_language: {
            ...state.manifest.target_language,
            id: action.languageId,
            name: action.languageName,
            direction: action.languageDirection
          }
        }
      };
    case consts.SAVE_CHECKERS_LIST_IN_MANIFEST:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          checkers: action.checkers
        }
      };
    case consts.SAVE_TRANSLATORS_LIST_IN_MANIFEST:
      return {
        ...state,
        manifest: {
          ...state.manifest,
          translators: action.translators
        }
      };
    case consts.SET_PROJECT_TYPE:
      return {
        ...state,
        projectType: action.projectType
      };
    case consts.RESET_PROJECT_DETAIL:
      return initialState;
    default:
      return state;
  }
};

export default projectDetailsReducer;

/**
 * Returns the save location of the current project
 * @param {object} state the project details slice of the state
 */
export const getSaveLocation = (state) =>
  state.projectSaveLocation;

/**
 * Returns the project manifest
 * @param {object} state the project details slice of the state
 */
export const getManifest = (state) =>
  state.manifest;
