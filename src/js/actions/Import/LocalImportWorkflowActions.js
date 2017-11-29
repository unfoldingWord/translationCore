/**
 * @Description:
 * Actions that dispatch other actions to wrap up local importing
 *
**/
import { convert } from './FileConversionActions';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const localImport = () => {
  return((dispatch) => {
    dispatch(convert());
    dispatch(migrate());
    dispatch(validate());
    dispatch(move());
  });
};
