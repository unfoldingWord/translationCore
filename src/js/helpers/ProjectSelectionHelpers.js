//fs modules
import * as fs from 'fs-extra';
import Path from 'path-extra';
//constants
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore', 'projects');
//helpers
import * as LoadHelpers from './LoadHelpers';
import * as usfmHelpers from './usfmHelpers.js';

/**
 * Retrieves tC manifest and returns it or if not available looks for tS manifest.
 * If neither are available tC has no way to load the project, unless its a usfm project.
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 * @param {string} username - Current username of user logged in.
 */
export function getProjectManifest(projectPath, projectLink, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;
  if (!manifest || !manifest.tcInitialized) {
    manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, username);
  }
  return manifest;
}

/**
 * Retrieves tC manifest and returns it or if not available creates
 * tC manifest from data available in usfm.
 * @param {string} projectPath - Path location in the filesystem for the project.
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git.
 * @param {object} parsedUSFM - USFM parsed using usfm-js module includes headers and usfm chapter content.
 * @param {string} direction - Direction of target language reading style i.e. 'ltr'.
 * @param {string} username - Current username of user logged in.
 */
export function getUSFMProjectManifest(projectPath, projectLink, parsedUSFM, direction, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  if (!manifest) {
    const defaultManifest = usfmHelpers.setUpDefaultUSFMManifest(parsedUSFM, direction, username);
    manifest = LoadHelpers.saveManifest(projectPath, projectLink, defaultManifest);
  }
  return manifest;
}
