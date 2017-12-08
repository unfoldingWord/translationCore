import * as Version from '../VersionHelpers';
const MIGRATE_MANIFEST_VERSION = 1;

/**
 * @description
 * function that conditionally runs the migration if needed
 */
export default (projectPath) => {
  if (shouldRun(projectPath)) run(projectPath);
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
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};
