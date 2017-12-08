<<<<<<< HEAD
/**
 * @Description:
 * Actions that call helpers to handle business logic for migtaions
**/

export const migrate = () => {
  // return((dispatch, getState) => {
  // });
=======
import migrations from '../../helpers/ProjectMigration/';

/**
 * @description Action that call helpers to handle business logic for migtaions
 * @param {String} projectPath
 */
export const migrate = (projectPath) => {
  migrations(projectPath);
>>>>>>> 7f6897c218b9d4b6b85a4fbfb4ec51139a32b68e
};
