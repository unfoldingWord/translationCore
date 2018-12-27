import consts from '../ActionTypes';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import migrateProject from '../../helpers/ProjectMigration';
import {initializeReducersForProjectOpenValidation, validateProject} from '../Import/ProjectValidationActions';
import * as BodyUIActions from '../BodyUIActions';
import * as RecentProjectsActions from '../RecentProjectsActions';
import {openAlertDialog} from '../AlertModalActions';
import * as ProjectDetailsActions from '../ProjectDetailsActions';
import * as ProjectImportStepperActions from '../ProjectImportStepperActions';
//helpers
import * as manifestHelpers from '../../helpers/manifestHelpers';
import {
  getActiveLocaleLanguage,
  getProjectManifest, getSourceBook, getTargetBook, getToolGatewayLanguage,
  getTools,
  getTranslate,
  getUsername
} from "../../selectors";
import {isProjectSupported} from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import { loadBookTranslations } from "../ResourcesActions";
import ProjectAPI from "../../helpers/ProjectAPI";
import CoreAPI from "../../helpers/CoreAPI";
import { copyGroupDataToProject } from "../../helpers/ResourcesHelpers";

// constants
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

function delay(ms) {
  return new Promise ((resolve) =>
    setTimeout(resolve, ms)
  );
}

/**
 * This thunk opens a project and prepares it for use in tools.
 * @param {string} name -  the name of the project
 */
export const openProject = (name) => {
  return async (dispatch, getState) => {
    const projectDir = path.join(PROJECTS_PATH, name);
    const translate = getTranslate(getState());

    try {
      dispatch(resetReducersData());
      dispatch(initializeReducersForProjectOpenValidation());
      dispatch(
        openAlertDialog(translate('projects.loading_project_alert'), true));
      // TRICKY: prevent dialog from flashing on small projects
      await delay(200);
      await isProjectSupported(projectDir, translate);
      migrateProject(projectDir, null, getUsername(getState()));
      await dispatch(validateProject(projectDir));

      // load the book data
      const manifest = getProjectManifest(getState());
      await dispatch(loadBookTranslations(manifest.project.id, name));

      // connect the tools
      const tools = getTools(getState());
      for (const t of tools) {
        // copy group data
        const language = getToolGatewayLanguage(getState(), t.name);
        copyGroupDataToProject(language, t.name, projectDir);

        // connect tool api
        const toolProps = makeToolProps(dispatch, getState(), projectDir, manifest.project.id);
        t.api.triggerWillConnect(toolProps);
      }

      await dispatch(displayTools());
    } catch (e) {
      // TODO: clean this up
      if (e.type !== 'div') console.warn(e);
      // clear last project must be called before any other action.
      // to avoid triggering autosaving.
      dispatch(clearLastProject());
      dispatch(openAlertDialog(e));
      dispatch(ProjectImportStepperActions.cancelProjectValidationStepper());
    }
  };
};

function resetReducersData() {
  // TODO: this is crazy. All of related reducers could be keyed by the same action.
  return (dispatch => {
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLEAR_ALIGNMENT_DATA });
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch({ type: consts.CLEAR_PREVIOUS_FILTERS});
  });
}

/**
 * TODO: this is very similar to what is in the {@link ToolContainer} and probably needs to be abstracted.
 * This is just a temporary prop generator until we can properly abstract the tc api.
 * @param dispatch
 * @param state
 * @param projectDir
 * @param bookId
 * @returns {*}
 */
function makeToolProps(dispatch, state, projectDir, bookId) {
  const projectApi = new ProjectAPI(projectDir);
  const coreApi = new CoreAPI(dispatch);
  const {code} = getActiveLocaleLanguage(state);
  const sourceBook = getSourceBook(state);
  const targetBook = getTargetBook(state);

  return {
    // project api
    readProjectDir: projectApi.readDataDir,
    readProjectDirSync: projectApi.readDataDirSync,
    writeProjectData: projectApi.writeDataFile,
    writeProjectDataSync: projectApi.writeDataFileSync,
    readProjectData: projectApi.readDataFile,
    readProjectDataSync: projectApi.readDataFileSync,
    projectDataPathExists: projectApi.dataPathExists,
    projectDataPathExistsSync: projectApi.dataPathExistsSync,
    deleteProjectFile: projectApi.deleteDataFile,

    // tC api
    showDialog: coreApi.showDialog,
    showLoading: coreApi.showLoading,
    closeLoading: coreApi.closeLoading,
    showIgnorableAlert: coreApi.showIgnorableAlert,
    appLanguage: code,

    // project data
    sourceBook,
    targetBook,

    contextId: {
      reference: {
        bookId,
        chapter: "1", // TRICKY: just some dummy values at first
        verse: "1"
      }
    },

    // deprecated props
    showIgnorableDialog: (...args) => {
      console.warn('DEPRECATED: showIgnorableDialog is deprecated. Use showIgnorableAlert instead');
      return coreApi.showIgnorableAlert(...args);
    },
    get toolsReducer () {
      console.warn(`DEPRECATED: toolsReducer is deprecated.`);
      return {};
    },
    projectFileExistsSync: (...args) => {
      console.warn(`DEPRECATED: projectFileExistsSync is deprecated. Use pathExistsSync instead.`);
      return projectApi.dataPathExistsSync(...args);
    },
    get targetBible() {
      console.warn('DEPRECATED: targetBible is deprecated. Use targetBook instead');
      return targetBook;
    },
    get sourceBible() {
      console.warn('DEPRECATED: sourceBible is deprecated. Use sourceBook instead');
      return sourceBook;
    },
  };
}

/**
 * @description - Opening the tools screen upon making sure the project is
 * not a titus or in the user is in developer
 */
export function displayTools() {
  return (dispatch, getState) => {
    const state = getState();
    const translate = getTranslate(state);
    return new Promise ((resolve, reject) => {
      try {
        const { currentSettings } = state.settingsReducer;
        const { manifest } = state.projectDetailsReducer;
        if (manifestHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
          // Go to toolsCards page
          dispatch(BodyUIActions.goToStep(3));
        } else {
          dispatch(RecentProjectsActions.getProjectsFromFolder());
          reject(translate('projects.books_available', {app: translate('_.app_name')}));
        }
      } catch (error) {
        console.error(error);
        reject(error);
      }
      resolve();
    });
  };
}

/**
 * @description - Wrapper to clear everything in the store that could
 * prevent a new project from loading
 */
export function clearLastProject() {
  return (dispatch) => {
    /**
     * ATTENTION: THE project details reducer must be reset
     * before any other action being called to avoid
     * autosaving messing up with the project data.
     */
    dispatch({ type: consts.RESET_PROJECT_DETAIL });
    dispatch(BodyUIActions.toggleHomeView(true));
    dispatch(ProjectDetailsActions.resetProjectDetail());
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
    dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
    dispatch({ type: consts.CLEAR_CONTEXT_ID });
    dispatch({ type: consts.CLOSE_TOOL });
    dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
    dispatch({ type: consts.CLEAR_PREVIOUS_FILTERS});
  };
}

/**
 * @description loads and set the projects details into the projectDetailsReducer.
 * @param {string} projectPath - path location in the filesystem for the project.
 * @param {object} manifest - project manifest.
 */
export function loadProjectDetails(projectPath, manifest) {
  return (dispatch) => {
    dispatch(ProjectDetailsActions.setSaveLocation(projectPath));
    dispatch(ProjectDetailsActions.setProjectManifest(manifest));
  };
}
