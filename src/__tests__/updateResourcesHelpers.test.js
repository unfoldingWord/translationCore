import path from 'path';
import fs from 'fs-extra';
import updateResourcesHelpers from '../../scripts/resources/updateResourcesHelpers';
import {
  APP_VERSION,
  TC_VERSION,
  USER_RESOURCES_PATH,
  STATIC_RESOURCES_PATH,
} from '../js/common/constants';
jest.mock('fs-extra');

describe('ResourcesHelpers.updateSourceContentUpdaterManifest()', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  test('should update date if manifest missing', () => {
    // given
    const date = new Date();
    const manifestPath = path.join(USER_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    expect(fs.existsSync(manifestPath)).not.toBeTruthy();

    // when
    updateResourcesHelpers.updateSourceContentUpdaterManifest(USER_RESOURCES_PATH);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    validateDateRange(manifest, date);
  });

  test('should update date and not change version if manifest present', () => {
    // given
    const date = new Date();
    const userDate = '2019-04-02T19:10:02.492Z';
    loadSourceContentUpdaterManifests('', userDate, APP_VERSION);
    const manifestPath = path.join(USER_RESOURCES_PATH,
      'source-content-updater-manifest.json');
    expect(fs.existsSync(manifestPath)).toBeTruthy();

    // when
    updateResourcesHelpers.updateSourceContentUpdaterManifest(USER_RESOURCES_PATH);

    // then
    const manifest = fs.readJSONSync(manifestPath);
    expect(manifest[TC_VERSION]).toEqual(APP_VERSION);
    validateDateRange(manifest, date);
  });
});

//
// Helpers
//

function loadSourceContentUpdaterManifests(bundledDate, userDate, appVersion = APP_VERSION) {
  const bundledResourcesManifestPath = path.join(STATIC_RESOURCES_PATH, 'source-content-updater-manifest.json');
  fs.ensureDirSync(STATIC_RESOURCES_PATH);

  if (bundledDate) {
    fs.outputJsonSync(bundledResourcesManifestPath, { modified: bundledDate });
  }

  const resourcesManifestPath = path.join(USER_RESOURCES_PATH, 'source-content-updater-manifest.json');
  fs.ensureDirSync(USER_RESOURCES_PATH);

  if (userDate) {
    const manifest = { modified: userDate };

    if (typeof appVersion === 'string') {
      manifest[TC_VERSION] = appVersion; // add app version to resource
    }
    fs.outputJsonSync(resourcesManifestPath, manifest);
  }
}

function validateDateRange(manifest, date) {
  const manifestModifiedDate = new Date(manifest.modified);
  const deltaInMs = manifestModifiedDate.valueOf() - date.valueOf();
  expect(deltaInMs).not.toBeLessThan(0);
  expect(deltaInMs).toBeLessThan(100);
}

