import migrateAppsToDotApps from './migrateAppsToDotApps';
import migrateToVersion1 from './migrateToVersion1';
import migrateToVersion2 from './migrateToVersion2';
import migrateToVersion3 from './migrateToVersion3';

/**
 * @Description:
 * Helpers for migrating projects but not specific to one migration
 * @param {String} projectSaveLocation - path to project
 * @param {string} link - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */

export default (projectSaveLocation, link) => {
  migrateAppsToDotApps(projectSaveLocation);
  migrateToVersion1(projectSaveLocation, link);
  migrateToVersion2(projectSaveLocation, link);
  migrateToVersion3(projectSaveLocation, link);
};
