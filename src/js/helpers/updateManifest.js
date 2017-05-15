import path from 'path-extra';
import fs from 'fs-extra';
/**
 * @description edits a projects manifest by adding the repo
 * link url to the manifest object.
 * @param {string} projectPath - path/directory to the project.
 * @param {string} remoteLink - project repo url.j
 */
export function updateManifest(projectPath, remoteLink, showAlert) {
  try {
    let manifestPath = path.join(projectPath, 'manifest.json');
    let manifestFile = fs.readJsonSync(manifestPath);
    manifestFile.repo = remoteLink;
    fs.outputJson(manifestPath, manifestFile, err => {
      if (err !== null) console.error(err);
    });
  } catch (err) {
    showAlert("There's something wrong with your project's files.");
    console.error(err);
  }
}
