import migrations from '../../helpers/ProjectMigration/';
/**
 * @Description:
 * Actions that call helpers to handle business logic for migtaions
**/

export const migrate = () => {
  return ((dispatch, getState) => {
    let { projectSaveLocation } = getState().projectDetailsReducer;
    migrations(projectSaveLocation);
  });
};
