import path from 'path';
import pathex from 'path-extra';
import * as fs from 'fs-extra';
/* eslint-env jest */
/* eslint-disable no-console */
'use strict';
import migrateAppsToDotApps from '../src/js/helpers/ProjectMigration/migrateAppsToDotApps';
const LEGACY_MIGRATED = '__tests__/fixtures/project/migration/legacy_migrated';
const LEGACY = '__tests__/fixtures/project/migration/legacy';
jest.mock('fs-extra');

describe('migrateAppsToDotApps', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({
      [LEGACY_MIGRATED]:['apps', '.apps'],
      [LEGACY]:['apps'],
      [path.join(LEGACY_MIGRATED, 'apps')]: {},
      [path.join(LEGACY_MIGRATED, '.apps')]: {},
      [path.join(LEGACY, 'apps')]: {}
    });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('remove the regular apps folder if both legacy and new folder exist', () => {
    migrateAppsToDotApps(LEGACY_MIGRATED);
    expect(fs.existsSync(path.join(LEGACY_MIGRATED, 'apps'))).toBeFalsy();
    expect(fs.existsSync(path.join(LEGACY_MIGRATED, '.apps'))).toBeTruthy();
  });

  it('rename the regular apps folder if legacy the folder exist', () => {
    migrateAppsToDotApps(LEGACY);
    expect(fs.existsSync(path.join(LEGACY, '.apps'))).toBeTruthy();
    expect(fs.existsSync(path.join(LEGACY, 'apps'))).toBeFalsy();
  });
});