import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');

// Removes the resources folder from the tC user directory so that it is regenerated.
export function migrateResourcesFolder() {
  return (() => {
    fs.removeSync(USER_RESOURCES_PATH);
  });
}
