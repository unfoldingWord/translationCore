import fs from 'fs-extra';
import path from 'path-extra';
import * as Version from './VersionUtils';

export const MIGRATE_MANIFEST_VERSION = 6;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, projectLink) => {
  Version.getVersionFromManifest(projectPath, projectLink); // ensure manifest converted for tc

  if (shouldRun(projectPath)) {
    run(projectPath);
  }
};

/**
 * @description function that checks to see if the migration should be run
 * @param {String} projectPath - path to project
 * @return {boolean} true if version number needs to be updated
 */
const shouldRun = (projectPath) => {
  const version = Version.getVersionFromManifest(projectPath);
  return (version < MIGRATE_MANIFEST_VERSION);
};


/**
 * @description - update manifest version to this version
 * @param {String} projectPath - path to project
 * @return {null}
 */
const run = (projectPath) => {
  console.log('migrateToVersion6(' + projectPath + ')');
  migrateToVersion6(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

/**
 * @description Look at several places inside manifest for resource ID and
 *  nickname, and make sure they are in standard place in manifest
 *
 * @param {*} projectPath - Project where all related documentation resides
 */
const migrateToVersion6 = (projectPath) => {
  try {
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      const manifest = fs.readJsonSync(manifestPath);
      const originalResourceId = manifest.resource && manifest.resource.id;
      const originalNickname = manifest.resource && manifest.resource.name;

      if (!originalResourceId || !originalNickname) {
        findResourceIdAndNickname(manifest);

        if ((manifest.resource.id !== originalResourceId) ||
            (manifest.resource.name !== originalNickname)) { // if new setting found
          fs.outputJsonSync(manifestPath, manifest, { spaces: 2 });
        }
      }
    } else {
      console.warn('Manifest not found.');
    }
  } catch (e){
    console.error('Migration error: ' + e.toString());
  }
};

/**
 * try to find nickname and resourceId in tStudio or tCore manifest
 * @param manifest
 */
export function findResourceIdAndNickname(manifest) {
  let nickname = manifest && manifest.resource && manifest.resource.name ? manifest.resource.name : '';
  let resourceId = manifest && manifest.resource && manifest.resource.id ? manifest.resource.id : '';

  if (manifest.dublin_core) {
    nickname = nickname || manifest.dublin_core.title;
    resourceId = resourceId || manifest.dublin_core.identifier;
  }

  if (nickname || resourceId) {
    if (!manifest.resource) {
      manifest.resource = {};
    }

    if (resourceId) {
      manifest.resource.id = resourceId;
    }

    if (nickname) {
      manifest.resource.name = nickname;
    }
  }
}
