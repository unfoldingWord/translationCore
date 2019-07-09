// helpers
import {
  copySourceContentUpdaterManifest,
  getMissingResources,
  areResourcesNewer,
  removeOldThelps
} from '../helpers/ResourcesHelpers';

/**
 * Run migrations on the user tc resources folder. If it is determined the resources folder was
 * created before the source content updater then it will be deleted and a new resources folder
 * will be copied from tc to the users folder.
 */
export function migrateResourcesFolder() {
  return (() => {
    console.log("migrateResourcesFolder");
    if (areResourcesNewer()) {
      console.log("migrateResourcesFolder: copying newer resources");
      removeOldThelps();
      getMissingResources();
      copySourceContentUpdaterManifest();// Add source-content-updater-manifest.json
    } else {
      getMissingResources();
    }
  });
}

