// import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';

/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const onlineImport = (projectPath, projectLink) => {
  return((dispatch) => {
    //dispatch(OnlineImportWorkflowHelpers.cloneRepo());
    migrate(projectPath);
    dispatch(validate(projectPath, projectLink));
    dispatch(move());
  });
};
