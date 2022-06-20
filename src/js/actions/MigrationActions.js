// helpers
import {
  areResourcesNewer,
  copySourceContentUpdaterManifest,
  getMissingResources,
  moveResourcesFromOldGrcFolder,
  removeOldThelps,
  removeOutDatedResources,
} from '../helpers/ResourcesHelpers';

/**
 * Run migrations on the user tc resources folder. If it is determined the resources folder was
 * created before the source content updater then it will be deleted and a new resources folder
 * will be copied from tc to the user's folder.
 * param {boolean} removeOutDated - if true then will remove outdated resources
 */
export function migrateResourcesFolder(removeOutDated = true) {
  return (() => {
    console.log('migrateResourcesFolder');

    if (removeOutDated) {
      removeOutDatedResources();
    }

    if (areResourcesNewer()) {
      console.log('migrateResourcesFolder: copying newer resources');
      moveResourcesFromOldGrcFolder();
      const removedResources = removeOldThelps();

      // TODO: this will be used in later issue to prompt user
      if (Object.keys(removedResources).length) {
        console.log('Removed resources: ', JSON.stringify(removedResources));
      }
      getMissingResources();
      copySourceContentUpdaterManifest();// Add source-content-updater-manifest.json
    } else {
      getMissingResources();
    }
  });
}

