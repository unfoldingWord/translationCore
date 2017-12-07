import migrations from '../../helpers/ProjectMigration/';

/**
 * @description Action that call helpers to handle business logic for migtaions
 * @param {String} projectPath
 */
export const migrate = (projectPath) => {
  migrations(projectPath);
};
