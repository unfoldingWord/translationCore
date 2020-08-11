/**
 * Migrate Booknames tests the following use cases
 * 1 - Missing manifest
 * 2 - Manifest already has translated book name
 * 3 - Migration should add translated name to manifest from project front matter
 * 4 - Migration should add translated name to manifest from 00/title.txt
 * 5 - Migration should add translated name to manifest from usfm header
 */
import fs from 'fs-extra';
import path from 'path-extra';
import migrateToAddTargetLanguageBookName from '../js/helpers/ProjectMigration/migrateToAddTargetLanguageBookName.js';
jest.mock('fs-extra');

const projectPath = path.join('mock', 'path', 'to', 'project');
const directoryToManifest = path.join(projectPath, 'manifest.json');
const manifest = {
  'generator': {
    'name': 'ts-desktop',
    'build': '132',
  },
  'target_language': {
    'id': 'es-419',
    'name': 'Español Latin America',
    'direction': 'ltr',
  },
  'project': {
    'id': 'eph',
    'name': 'Ephesians',
  },
};

describe('Test ability to translate bookname into target language fom manifest given a project class',()=> {
  test('Project has no manifest', () => { // this is really no project
    const projectPath = '/dummy/path';
    // Must return or await expect when testing promises rejections see: https://jestjs.io/docs/en/expect#rejects
    return expect(migrateToAddTargetLanguageBookName(projectPath)).rejects.toThrow('Manifest not found.');
  });

  test('Project has translated name in manifest', async () => {
    const manifest = {
      'generator': {
        'name': 'ts-desktop',
        'build': '132',
      },
      'target_language': {
        'id': 'es-419',
        'name': 'Español Latin America',
        'direction': 'ltr',
        'book': { 'name': 'Efesios' },
      },
      'project': {
        'id': 'eph',
        'name': 'Ephesians',
      },
    };

    fs.__setMockFS({ [directoryToManifest]: manifest });

    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });

  test('Project has front matter', async () => {
    const frontPath = path.join('mock', 'path', 'to', 'project', 'front', 'title.txt');

    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [frontPath]: 'Efesios',
    });

    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });

  test('Project has chapter 0', async () => {
    const pathTo0 = path.join('mock', 'path', 'to', 'project', '00', 'title.txt');

    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [pathTo0]: 'Efesios',
    });

    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });

  test('Project has USFM header', async () => {
    const pathToUSFM = path.join(projectPath, '.apps', 'translationCore', 'importedSource', 'eph.usfm');
    const USFM = `
\\id TIT EN_ULB hi_Hindi_ltr Wed Feb 21 2018 12:39:16 GMT-0500 (EST) tc
\\h Efesios
\\c 1`;

    fs.__setMockFS({
      [directoryToManifest]: manifest,
      [pathToUSFM]: USFM,
    });

    const manifestWithTargetLanguageBookName = await migrateToAddTargetLanguageBookName(projectPath);
    expect(manifestWithTargetLanguageBookName.target_language.book.name).toEqual('Efesios');
  });
});
