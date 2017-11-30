import * as manifestValidationHelpers from '../../helpers/ProjectValidation/ManifestValidationHelpers';
import * as projectStructureValidatoinHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as AlertModalActions from '../AlertModalActions';
/**
 * @Description:
 * Actions that call helpers to handle business logic for validations
**/

export const validate = (projectPath) => {
  return (async (dispatch) => {
    try {
      debugger;
      await manifestValidationHelpers.manifestExists(projectPath);
      await projectStructureValidatoinHelpers.verifyProjectType(projectPath);
      await projectStructureValidatoinHelpers.detectInvalidProjectStructure(projectPath);
    } catch (err) {
      await dispatch(AlertModalActions.openAlertDialog(err));
    }
  });
};
