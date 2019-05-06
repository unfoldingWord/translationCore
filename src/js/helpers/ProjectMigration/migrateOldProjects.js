/* eslint-disable no-console */

import * as manifestUtils from "./manifestUtils";
import packagefile from '../../../../package';

export const tc_EDIT_VERSION_KEY = "tc_edit_version";

/**
 * @description
 * function that conditionally runs the migration if needed
 */
export default (projectPath) => {
  if (shouldRun(projectPath)) run(projectPath);
};

/**
 * @description
 * function that checks to see if the migration should be run
 */
const shouldRun = (projectPath) => {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  if (!manifest || (manifest[tc_EDIT_VERSION_KEY] !== packagefile.version)) {
    return true;
  }
  return false;
};

/**
 * @description - Legacy projects have a apps folder not hidden
 * these need to be migrated to the new workflow of having them hidden
 */
const run = (projectPath) => {
  console.log("migrateOldProjects(" + projectPath + ")");
  ?? //TODO: do git commit
};
