import * as LoadHelpers from './LoadHelpers';

export function getProjectManifest(projectPath, projectLink, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;
  if (!manifest || !manifest.tcInitialized) {
    console.log('setting up manifest')
    manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, username);
  }
  return manifest;
}