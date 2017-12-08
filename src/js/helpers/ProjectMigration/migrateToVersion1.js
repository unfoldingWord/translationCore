import * as Version from '../VersionHelpers';
import * as ProjectSelectionHelpers from "../ProjectSelectionHelpers";
export const MIGRATE_MANIFEST_VERSION = 1;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} link - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, link) => {
  ProjectSelectionHelpers.getProjectManifest(projectPath, link); // ensure manifest converted for tc
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
