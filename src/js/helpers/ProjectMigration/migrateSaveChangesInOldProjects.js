/* eslint-disable no-console */
import Repo from '../Repo';
// constants
import { APP_VERSION, tc_EDIT_VERSION_KEY } from '../../common/constants';
import * as manifestUtils from './manifestUtils';

/**
 * Conditionally runs the migration if needed
 * @param {String} projectPath
 * @return {Boolean} if needed migration
 */
const migrateSaveChangesInOldProjects = async (projectPath) => {
  const ifShouldRun = shouldRun(projectPath);

  if (ifShouldRun) {
    await run(projectPath);
  }
  return ifShouldRun;
};

/**
 * Checks to see if the migration should be run
 * @param {String} projectPath
 * @return {Boolean} if needed migration
 */
const shouldRun = (projectPath) => {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);

  if (manifest) {
    const manifestVersion = manifest[tc_EDIT_VERSION_KEY] || '';

    if (manifestVersion !== APP_VERSION) {
      console.log(`migrateOldProjects.shouldRun(${projectPath}) - saved project version of '${manifestVersion}' does not match APP version '${APP_VERSION}', will save changes in git`);
      return true;
    }
  }
  return false;
};

/**
 * Make sure project changes saved to git. Throws exception on error.
 * @param {String} projectPath
 */
const run = async (projectPath) => {
  console.log(`migrateOldProjects.run(${projectPath})`);
  // do git commit
  const repo = await Repo.openSafe(projectPath);
  console.log('migrateSaveChangesInOldProjects.run() - doing git save');
  await repo.save(`Migrating Old Project`);
  console.log('migrateSaveChangesInOldProjects.run() - git save complete');
};

export default migrateSaveChangesInOldProjects;
