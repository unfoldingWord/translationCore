import * as manifestValidationHelpers from '../../helpers/ProjectValidation/ManifestValidationHelpers';
import * as projectStructureValidatoinHelpers from '../../helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as AlertModalActions from '../AlertModalActions';
/**
 * @Description:
 * Actions that call helpers to handle business logic for validations
**/

export const validate = (projectPath) => {
  return ((dispatch) => {
    manifestValidationHelpers.manifestExists(projectPath)
    .then(projectStructureValidatoinHelpers.verifyProjectType)
      .then(projectStructureValidatoinHelpers.detectInvalidProjectStructure)
      .then()
      .catch((err) => {
        debugger;
        dispatch(AlertModalActions.openAlertDialog(err));
      });
  });
};
