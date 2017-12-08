/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
import * as Constants from '../../common/Constants';
/**
 * @description
 * function that conditionally runs the migration if needed
 */
export default (projectPath) => {
  const manifest = readManifest(projectPath);
  if (shouldRun(projectPath, manifest)) run(projectPath, manifest);
};

/**
 * @description
 * function that checks to see if the migration should be run
 */
const shouldRun = (projectPath, manifest) => {
  return (manifest && ((!manifest[Constants.VERSION_KEY]) || (manifest[Constants.VERSION_KEY] < 1)));
};

/**
 * @description - Legacy projects have a apps folder not hidden
 * these need to be migrated to the new workflow of having them hidden
 */
const run = (projectPath, manifest) => {
  manifest[Constants.VERSION_KEY] = 1;
  writeManifest(projectPath, manifest);
};

const getManifestPath = (projectPath) => {
  const projectManifestPath = path.join(projectPath, "manifest.json");
  const projectTCManifestPath = path.join(projectPath, "tc-manifest.json");
  return fs.existsSync(projectManifestPath) ? projectManifestPath
    : fs.existsSync(projectTCManifestPath) ? projectTCManifestPath : null;
};

const readManifest = (projectPath) => {
  const validManifestPath = getManifestPath(projectPath);
  if (validManifestPath) {
    return fs.readJsonSync(validManifestPath);
  }
  return null;
};

const writeManifest = (projectPath, manifest) => {
  if (manifest) {
    const validManifestPath = getManifestPath(projectPath);
    if (validManifestPath) {
      fs.outputJsonSync(validManifestPath, manifest);
    }
  }
};
