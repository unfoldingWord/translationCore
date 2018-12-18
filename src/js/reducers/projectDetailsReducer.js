import consts from '../actions/ActionTypes';
import path from 'path-extra';

const initialState = {
  projectSaveLocation: '',
  manifest: {
    project: {},
    resource: {}
  },
  currentProjectToolsProgress: {},
  currentProjectToolsSelectedGL: {},
  projectType: null,
  toolsCategories: {
    translationWords: ['kt', 'other', 'names']
  }
};

const projectDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case consts.SET_CHECK_CATEGORIES:
    return {
      ...state,
      toolsCategories: {
        ...state.toolsCategories,
        [action.toolName]: action.selectedCategories
      }
    };
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
 * Returns the gateway language selected for the given tool.
 * @param state
 * @param {string} toolName - the name of the tool to look up
 * @returns {string} - the gateway language code. Default value is "en".
 */
export const getToolGatewayLanguage = (state, toolName) => {
  if(state) {
    const languages = state.currentProjectToolsSelectedGL;
    if(languages.hasOwnProperty(toolName) && languages[toolName]) {
      return languages[toolName];
    }
  }
  return "en";
};

/**
 * Returns the progress of a tool
 * @param state
 * @param toolName
 * @returns {*}
 */
export const getToolProgress = (state, toolName) => {
  if(state.currentProjectToolsProgress[toolName]) {
    return state.currentProjectToolsProgress[toolName];
  } else {
    return 0;
  }
};

/**
 * Returns the file path where the project is saved
 * @param {object} state - the project details slice of the state
 */
export const getSaveLocation = (state) =>
  state.projectSaveLocation;

/**
 * Returns the name of the project
 * @param state
 * @return {string}
 */
export const getName = state => {
  const saveLocation = getSaveLocation(state);
  return path.basename(saveLocation);
};

/**
 * Returns the nickname of the project
 * @param state
 * @return {string}
 */
export const getNickname = state => {
  const manifest = getManifest(state);
  if (manifest && manifest.resource && manifest.resource.name) {
    return manifest.resource.name;
  } else {
    return '';
  }
};

/**
 * Returns the book id
 * @param state
 * @returns {string|null} the book id or null if not found
 */
export const getBookId = state => {
  const manifest = getManifest(state);
  if(manifest && manifest.project) {
    return manifest.project.id;
  } else {
    return null;
  }
};

/**
 * Returns the project manifest
 * @param {object} state the project details slice of the state
 */
export const getManifest = (state) =>
  state.manifest;

export const getToolCategories = (state, toolName) =>
[...state.toolsCategories[toolName]];
