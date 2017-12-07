import migrateAppsToDotApps from './migrateAppsToDotApps';
import migrateToVersion1 from './migrateToVersion1';

/**
 * @Description:
 * Helpers for migrating projects but not specific to one migration
 * Functions for wrapping all migrations
 */

export default (projectSaveLocation) => {
  migrateAppsToDotApps(projectSaveLocation);
  migrateToVersion1(projectSaveLocation);
};
