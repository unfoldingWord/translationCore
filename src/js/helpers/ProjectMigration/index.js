import * as migrateAppsToDotApps from './oneTypeOfMigrationHelpers';
/**
 * @Description:
 * Helpers for migrating projects but not specific to one migration
 * Functions for wrapping all migrations
 */

export default (projectSaveLocation) => {
  migrateAppsToDotApps(projectSaveLocation);
};
