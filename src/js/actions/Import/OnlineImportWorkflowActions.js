import * as OnlineImportWorkflowHelpers from '../../helpers/Import/OnlineImportWorkflowHelpers';

/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const onlineImport = () => {
  return((dispatch) => {
    dispatch(OnlineImportWorkflowHelpers.cloneRepo());
    dispatch(migrate());
    dispatch(validate());
    dispatch(move());
  });
};
