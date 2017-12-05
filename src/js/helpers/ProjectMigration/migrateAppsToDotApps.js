/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';

// TODO: Plan out convention for migrations
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
const shouldRun = () => {
  return true;
};

/**
 * @description
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
