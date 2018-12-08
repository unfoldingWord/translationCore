import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// helpers
import {getResourcesFromStaticPackage, getMissingResources} from '../helpers/ResourcesHelpers';
// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');

/**
 * Run migrations on the user tc resources folder. If it is determined the resources folder was
 * created before the source content updater then it will be deleted and a new resources folder
 * will be copied from tc to the users folder.
 */
export function migrateResourcesFolder() {
  return (() => {
    if (!fs.existsSync(path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json'))) {
      fs.removeSync(USER_RESOURCES_PATH);
      getResourcesFromStaticPackage();
    } else {
      getMissingResources();
    }
  });
}

