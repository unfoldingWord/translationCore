/**
 * @Description:
 * Actions that dispatch other actions to wrap up loading projects
**/
import path from 'path-extra';
import { migrate } from '../Import/ProjectMigrationActions';
import { validate } from '../Import/ProjectValidationActions';
import * as ToolsMetadataActions from '../ToolsMetadataActions';
import * as BodyUIActions from '../BodyUIActions';
import * as RecentProjectsActions from '../RecentProjectsActions';
import * as AlertModalActions from '../AlertModalActions';
//helpers
import * as manifestHelpers from '../../helpers/manifestHelpers';
const PROJECTS_PATH = path.join(path.homedir(), 'translationCore', 'projects');
/**
 * @Description: action that Migrates, Validates and Loads the Project
 * This may seem redundant to run migrations and validations each time
 * But the helpers called from each action test to only run when needed
**/
export const migrateValidateLoadProject = (selectedProjectFilename) => {
  return(async (dispatch) => {
    let projectPath = path.join(PROJECTS_PATH, selectedProjectFilename);
    migrate(projectPath);
    await dispatch(validate(projectPath));
    dispatch(displayTools());
  });
};

export function displayTools() {
  return ((dispatch, getState) => {
    const { currentSettings } = getState().settingsReducer;
    const { manifest } = getState().projectDetailsReducer;
    if (manifestHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
      dispatch(ToolsMetadataActions.getToolsMetadatas());
      // Go to toolsCards page
      dispatch(BodyUIActions.goToStep(3));
    } else {
      dispatch(AlertModalActions.openAlertDialog('This version of translationCore only supports Titus projects.'));
      dispatch(RecentProjectsActions.getProjectsFromFolder());
    }
  });
}
