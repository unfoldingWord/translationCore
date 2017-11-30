/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { cloneRepo } from '../../helpers/Import/OnlineImportWorkflowHelpers';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const onlineImport = (projectPath, projectLink) => {
  return (async (dispatch) => {
    //dispatch(cloneRepo());
    migrate(projectPath);
    await dispatch(validate(projectPath, projectLink));
    dispatch(move());
  });
};
