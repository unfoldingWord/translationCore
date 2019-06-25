/* eslint-disable no-console */
/**
 * migration that makes sure that all changes in old projects are saved to git. This is called before any migrations are made to project.
 */
import * as manifestUtils from "./manifestUtils";
import Repo from "../Repo";
// constants
import { APP_VERSION, tc_EDIT_VERSION_KEY } from '../../common/constants';

/**
 * @description - function that conditionally runs the migration if needed
 * @param {String} projectPath
 * @return {Boolean} if needed migration
 */
export const migrateSaveChangesInOldProjects = async (projectPath) => {
  const ifShouldRun = shouldRun(projectPath);
  if (ifShouldRun) {
    await run(projectPath);
  }
  return ifShouldRun;
};

/**
 * @description - function that checks to see if the migration should be run
 * @param {String} projectPath
 * @return {Boolean} if needed migration
 */
const shouldRun = (projectPath) => {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  if (manifest) {
    const manifestVersion = manifest[tc_EDIT_VERSION_KEY] || "";
    if (manifestVersion !== APP_VERSION) {
      console.log(`migrateOldProjects.shouldRun(${projectPath}) - saved project version of '${manifestVersion}' does not match APP version '${APP_VERSION}', will save changes in git`);
      return true;
    }
  }
  return false;
};

/**
 * @description - make sure project changes saved to git.  Throws exception on error.
 * @param {String} projectPath
 */
const run = async (projectPath) => {
  console.log(`migrateOldProjects.run(${projectPath})`);
  // do git commit
  const repo = await Repo.open(projectPath);
  console.log("migrateSaveChangesInOldProjects.run() - doing git save");
  await repo.save(`Migrating Old Project`);
  console.log("migrateSaveChangesInOldProjects.run() - git save complete");
};

export default migrateSaveChangesInOldProjects;
