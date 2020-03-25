/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
import env from 'tc-electron-env';
import {
  generateImportPath,
  verifyThisIsTCoreOrTStudioProject,
} from '../OnlineImportWorkflowHelpers';
import { DCS_BASE_URL } from '../../../common/constants';

jest.mock('fs-extra');

describe('OnlineImportWorkflowHelpers.generateImportPath', function () {
  beforeEach(() => {
    const destDir = path.join(env.home(), 'translationCore', 'imports',
      'sample_project');
    fs.ensureDirSync(destDir);
  });

  test('should succeed on valid URL', async () => {
    const url = DCS_BASE_URL + '/klappy/bhadrawahi_tit.git';
    const re = new RegExp((`.*translationCore\\${path.sep}imports\\${path.sep}bhadrawahi_tit`));
    let importPath = await generateImportPath(url);
    expect(importPath).toEqual(expect.stringMatching(re));
  });

  test('should throw error if already exists', async () => {
    const url = DCS_BASE_URL + '/klappy/sample_project.git';

    await expect(generateImportPath(url))
      .rejects
      .toEqual(new Error('Project sample_project has already been imported.'));
  });

  test('null link should show error', async () => {
    await expect(generateImportPath(null))
      .rejects
      .toEqual(new Error('The URL null does not reference a valid project'));
  });

  test('should handle missing .git', async () => {
    const url = DCS_BASE_URL + '/klappy/bhadrawahi_tit';
    const re = new RegExp((`.*translationCore\\${path.sep}imports\\${path.sep}bhadrawahi_tit`));
    let importPath = await generateImportPath(url);
    expect(importPath).toEqual(expect.stringMatching(re));
  });
});

describe('OnlineImportWorkflowHelpers.generateImportPath', function () {
  it('should import a ts-desktop generated project', () => {
    const projectPath = '/project/path';
    const manifest = { generator: { name: 'ts-desktop' } };
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it('should import a ts-android generated project', () => {
    const projectPath = '/project/path';
    const manifest = { generator: { name: 'ts-android' } };
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it('should import a tc-desktop generated project', () => {
    const projectPath = '/project/path';
    const manifest = { generator: { name: 'tc-desktop' } };
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it('should import a tcInitialized project', () => {
    const projectPath = '/project/path';
    const manifest = { tcInitialized: true };
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it('should import a tc_version project', () => {
    const projectPath = '/project/path';
    const manifest = { tc_version: 5 };
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it('should not import a project with missing keys', () => {
    const projectPath = '/project/path';
    const manifest = {};
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).not.toBeTruthy();
  });

  it('should not import a project with unknown generator', () => {
    const projectPath = '/project/path';
    const manifest = { generator: { name: 'my-app' } };
    fs.writeJSONSync(path.join(projectPath, 'manifest.json'), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).not.toBeTruthy();
  });

  it('should not import a project with missing manifest', () => {
    const projectPath = '/project/path';
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).not.toBeTruthy();
  });

  it('should import a project with a tc-manifest.json', () => {
    const projectPath = '/project/path';
    fs.writeJSONSync(path.join(projectPath, 'tc-manifest.json'), {});
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });
});
