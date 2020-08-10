/* eslint-env jest */
/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
import migrateToVersion7, { MIGRATE_MANIFEST_VERSION } from '../js/helpers/ProjectMigration/migrateToVersion7';
import * as Version from '../js/helpers/ProjectMigration/VersionUtils';
jest.mock('fs-extra');

const FIXTURES_PATH = path.join(__dirname, 'fixtures/migration/v6_projects/en_ult_tit_book');
const PROJECT_PATH = path.join(path.homedir(), 'translationCore/projects/en_ult_tit_book');
const USER_NAME = 'johndoe';

describe('migrateToVersion7', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.__loadDirIntoMockFs(FIXTURES_PATH, PROJECT_PATH);
  });

  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('Expect version to be set in manifest after migration', () => {
    // given
    const expectedVersion = 7;

    // when
    migrateToVersion7(PROJECT_PATH, USER_NAME);

    // then
    const version = Version.getVersionFromManifest(PROJECT_PATH);
    expect(MIGRATE_MANIFEST_VERSION).toBe(expectedVersion); // this shouldn't change
    expect(version).toBe(MIGRATE_MANIFEST_VERSION);
  });

  it('with same tc_version expect to leave alone', () => {
    // given
    const manifestVersion = MIGRATE_MANIFEST_VERSION;
    Version.setVersionInManifest(PROJECT_PATH, manifestVersion);

    // when
    migrateToVersion7(PROJECT_PATH, USER_NAME);

    // then
    const version = Version.getVersionFromManifest(PROJECT_PATH);
    expect(version).toBe(manifestVersion);
  });

  it('should make a new verse edit with the existing Titus 1:15 text', () => {
    // given
    const expectedUserName = USER_NAME;
    const verseEditsPath = path.join(PROJECT_PATH, '.apps/translationCore/checkData/verseEdits/tit/1/15');
    const expectedNumberVerseEdits = 2;
    const chapterVerses = fs.readJSONSync(path.join(PROJECT_PATH, 'tit', '1.json'));

    // when37
    migrateToVersion7(PROJECT_PATH, USER_NAME);
    const verseEdits = fs.readdirSync(verseEditsPath).filter(name => path.extname(name) === '.json').sort();
    const firstVerseEdit = fs.readJSONSync(path.join(verseEditsPath, verseEdits[0]));
    const lastVerseEdit = fs.readJSONSync(path.join(verseEditsPath, verseEdits[verseEdits.length-1]));

    // then
    expect(verseEdits.length).toEqual(expectedNumberVerseEdits);
    expect(lastVerseEdit['verseAfter']).toEqual(chapterVerses['15']);
    expect(lastVerseEdit['verseBefore']).toEqual(firstVerseEdit['verseAfter']);
    expect(lastVerseEdit['userName']).toEqual(expectedUserName);
  });
});

//
// helpers
//

export const getManifest = function (PROJECT_PATH) {
  const manifest_path = path.join(PROJECT_PATH, 'manifest.json');
  return fs.readJsonSync(manifest_path);
};

export const setManifest = function (PROJECT_PATH, manifest) {
  const manifest_path = path.join(PROJECT_PATH, 'manifest.json');
  return fs.outputJsonSync(manifest_path, manifest);
};

