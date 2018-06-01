import migrateToAddTargetLanguageBookName from './migrateToAddTargetLanguageBookName';
import migrateAppsToDotApps from './migrateAppsToDotApps';
import migrateToVersion1 from './migrateToVersion1';
import migrateToVersion2 from './migrateToVersion2';
import migrateToVersion3 from './migrateToVersion3';
import migrateToVersion4 from './migrateToVersion4';
import migrateToVersion5 from './migrateToVersion5';
import migrateToVersion6 from './migrateToVersion6';

/**
 * Helpers for migrating projects but not specific to one migration
 * @param {String} projectSaveLocation - path to project
 * @param {String} link - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectSaveLocation, link) => {
  migrateToAddTargetLanguageBookName(projectSaveLocation);
  migrateAppsToDotApps(projectSaveLocation);
  migrateToVersion1(projectSaveLocation, link);
  migrateToVersion2(projectSaveLocation, link);
  migrateToVersion3(projectSaveLocation, link);
  migrateToVersion4(projectSaveLocation, link);
  migrateToVersion5(projectSaveLocation, link);
  migrateToVersion6(projectSaveLocation);
};
