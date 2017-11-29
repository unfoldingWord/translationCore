/* eslint-env jest */
/* eslint-disable no-console */
'use strict';

jest.mock('fs-extra');
import fs from 'fs-extra';
//helpers
import * as ManifestValidationHelpers from '../src/js/helpers/ProjectValidation/ManifestValidationHelpers';
const MANIFEST_EXISTS_PATH = 'path/to/project/where/manifest/exists';
const MANIFEST_NOT_EXISTS_PATH = 'path/to/project/where/manifest/doesnt/exists';
beforeEach(() => {
  fs.__setMockFS({
    [MANIFEST_EXISTS_PATH]: [],
    [MANIFEST_EXISTS_PATH + '/manifest.json']: []
  });
});

describe('ManifestValidationHelpers.manifestExists', () => {
  test('should return that the manifest exists', () => {
    expect(ManifestValidationHelpers.manifestExists(MANIFEST_EXISTS_PATH)).toBeTruthy();
  });
  test('should return that the manifest does not exists', () => {
    expect(ManifestValidationHelpers.manifestExists(MANIFEST_NOT_EXISTS_PATH)).toBeFalsy();
  });
});