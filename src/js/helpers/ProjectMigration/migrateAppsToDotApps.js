/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';

/**
 * @description
 * function that conditionally runs the migration if needed
 */
export default (projectPath) => {
  if (shouldRun(projectPath)) {
    run(projectPath);
  }
};

/**
 * @description
 * function that checks to see if the migration should be run
 */
const shouldRun = () => true;

/**
 * @description - Legacy projects have a apps folder not hidden
 * these need to be migrated to the new workflow of having them hidden
 */
const run = (projectPath) => {
  console.log('migrateAppsToDotApps(' + projectPath + ')');
  let projectDir = fs.readdirSync(projectPath);

  if (projectDir.includes('apps') && projectDir.includes('.apps')) {
    fs.removeSync(path.join(projectPath, '.apps'));
  }

  if (projectDir.includes('apps')) {
    fs.renameSync(path.join(projectPath, 'apps'), path.join(projectPath, '.apps'));
  }
};
