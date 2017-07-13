import * as LoadHelpers from './LoadHelpers';

export function getProjectManifest(projectPath, projectLink, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
  manifest = manifest || tCManifest;
  if (!manifest || !manifest.tcInitialized) {
    manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, username);
  }
  return manifest;
}

export function getUSFMProjectManifest(projectPath, projectLink, parsedUSFM, direction, username) {
  let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
  if (!manifest) {
    const defaultManifest = LoadHelpers.setUpDefaultUSFMManifest(parsedUSFM, direction, username);
    manifest = LoadHelpers.saveManifest(projectPath, projectLink, defaultManifest);
  }
  return manifest;
}

export function getProjectDetailsFromUSFM(usfmFilePath, projectPath) {
  const usfmData = LoadHelpers.setUpUSFMProject(usfmFilePath, projectPath);
  const parsedUSFM = LoadHelpers.getParsedUSFM(usfmData);
  const targetLanguage = LoadHelpers.formatTargetLanguage(parsedUSFM);
  const direction = 'ltr';
  //No way to know for now
  return {parsedUSFM, direction, targetLanguage};
}