/* eslint-disable no-console */
import path from 'path-extra';
import * as fs from 'fs-extra';
/**
 * @Description:
 * Each migration needs a separate file named appropriately to what we're migrating from
 * and helper functions created to support the migration
 */

// TODO: Plan out convention for migrations

/**
 * @Description:
 * function that conditionally runs the migration if needed
 */
export default (projectPath) => {
  if (shouldRun(projectPath)) run(projectPath);
};

/**
 * @Description:
 * function that checks to see if the migration should be run
 */
const shouldRun = () => {
  return true;
};

/**
 * @Description:
 * function that actually runs the migration
 * should be further broken down into small modular functions
 */
const run = (projectPath) => {
  let projectDir = fs.readdirSync(projectPath);
  if (projectDir.includes('apps') && projectDir.includes('.apps')) {
    fs.removeSync(path.join(projectPath, '.apps'));
  }
  if (projectDir.includes('apps')) {
    fs.renameSync(path.join(projectPath, 'apps'), path.join(projectPath, '.apps'));
  }
};
