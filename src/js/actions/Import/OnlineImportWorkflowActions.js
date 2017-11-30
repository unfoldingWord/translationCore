/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/
import { clone } from '../../helpers/Import/OnlineImportWorkflowHelpers';
import { migrate } from './ProjectMigrationActions';
import { validate } from './ProjectValidationActions';
import { move } from './ProjectImportFilesystemActions';

export const onlineImport = () => {
  return (async (dispatch, getState) => {
    try {
    let link = getState().importOnlineReducer.importLink;
    let projectPath = await dispatch(clone(link));
    migrate(projectPath);
    await dispatch(validate(projectPath, link));
    dispatch(move());
    } catch (e) {
      //
    }
  });
};
