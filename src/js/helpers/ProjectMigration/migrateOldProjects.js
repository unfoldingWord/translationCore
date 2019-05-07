/* eslint-disable no-console */

import * as manifestUtils from "./manifestUtils";
import packagefile from '../../../../package';
import Repo from "../Repo";

export const tc_EDIT_VERSION_KEY = "tc_edit_version";

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath
 * @return {Boolean} if needed migration
 */
export const migrateOldProjects = async (projectPath) => {
  const ifShouldRun = shouldRun(projectPath);
  if (ifShouldRun) {
    await run(projectPath);
  }
  return ifShouldRun;
};

/**
 * @description
 * function that checks to see if the migration should be run
 * @param {String} projectPath
 * @return {Boolean} if needed migration
 */
const shouldRun = (projectPath) => {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  if (manifest) {
    const manifestVersion = manifest[tc_EDIT_VERSION_KEY] || "";
    if (manifestVersion !== packagefile.version) {
      console.log(`migrateOldProjects.shouldRun(${projectPath}) - saved project version of '${manifestVersion}' does not match APP version '${packagefile.version}'`);
      return true;
    }
  }
  return false;
};

/**
 * @description - Legacy projects have a apps folder not hidden
 * these need to be migrated to the new workflow of having them hidden
 * @param {String} projectPath
 */
const run = async (projectPath) => {
  console.log(`migrateOldProjects.run(${projectPath})`);
  // do git commit
  const repo = await Repo.open(projectPath);
  console.log("migrateOldProjects.run() - doing git save");
  await repo.save(`Migrating Old Project`);
  console.log("migrateOldProjects.run() - git save complete");
};

export default migrateOldProjects;
