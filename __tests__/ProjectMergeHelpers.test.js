import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import AdmZip from 'adm-zip';
import tmp from 'tmp';
import * as ProjectMergeHelpers from '../src/js/helpers/ProjectMergeHelpers';

jest.mock('fs-extra');
jest.unmock('adm-zip');

const BOOK_ID = 'tit';
const PROJECT_NAME = 'en_ulb_'+BOOK_ID+'_text';
const USER_NAME = 'user';
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECT_PATH = path.join(PROJECTS_PATH, PROJECT_NAME);
const IMPORT_PATH = path.join(IMPORTS_PATH, PROJECT_NAME);

const mockTranslate = key => key;

describe('ProjectMergeHelpers.handleProjectReimport() tests', () => {

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });

  it('handleProjectReimport() test that project dir gets removed after setting up import dir', () => {
    // given
    const projectZipFile = 'project_' + PROJECT_NAME + '.zip';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm2.zip';
    setupProjectDir(projectZipFile)
    setupImportDir(importZipFile);
    // when
    ProjectMergeHelpers.handleProjectMerge(PROJECT_PATH, IMPORT_PATH, USER_NAME, key=>key);
    // then
    // Check that project dir is now removed for import to be copied over
    expect(fs.pathExistsSync(PROJECT_PATH)).not.toBeTruthy();
  });
});

describe('ProjectMergeHelpers.mergeOldProjectToNewProject() tests', () => {

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });

  it('mergeOldProjectToNewProject() test project does not exist', () => {
    // given
    const projectZipFile = 'project_' + PROJECT_NAME + '.zip';
    setupProjectDir(projectZipFile)
    const badProjectPath = 'bad_project_path';
    const expectedError = 'Path for existing project not found: '+badProjectPath;
    // then
    expect(() => ProjectMergeHelpers.mergeOldProjectToNewProject(badProjectPath, IMPORT_PATH, mockTranslate)).toThrowError(expectedError);
  });

  it('mergeOldProjectToNewProject() test usfm2 import preserves all checks and alignments', () => {
    // given
    const projectZipFile = 'project_' + PROJECT_NAME + '.zip';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm2.zip';
    setupProjectDir(projectZipFile)
    setupImportDir(importZipFile);
    // when
    ProjectMergeHelpers.mergeOldProjectToNewProject(PROJECT_PATH, IMPORT_PATH, mockTranslate);
    // then
    const projectSelectionsDir = path.join(PROJECT_PATH, '.apps/translationCore/checkData/selections', BOOK_ID);
    const importSelectionsDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/selections', BOOK_ID);
    const chapters = fs.readdirSync(projectSelectionsDir).filter(filename => parseInt(filename) > 0);
    chapters.forEach(chapter => {
      const verses = fs.readdirSync(path.join(projectSelectionsDir, chapter)).filter(filename => parseInt(filename) > 0);
      verses.forEach(verse => {
        const files = fs.readdirSync(path.join(projectSelectionsDir, chapter, verse)).filter(filename => path.extname(filename) == '.json');
        files.forEach(file => {
          const projectFilePath = path.join(projectSelectionsDir, chapter, verse, file);
          const importFilePath = path.join(importSelectionsDir, chapter, verse, file);
          expect(fs.existsSync(importFilePath)).toBeTruthy();
          expect(fs.readJsonSync(projectFilePath)).toEqual(fs.readJsonSync(importFilePath));
        });
      });
    });
  });

  it('mergeOldProjectToNewProject() test usfm3 import preserves all checks', () => {
    // given
    const projectZipFile = 'project_' + PROJECT_NAME + '.zip';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm3.zip';
    setupProjectDir(projectZipFile)
    setupImportDir(importZipFile);
    // when
    ProjectMergeHelpers.mergeOldProjectToNewProject(PROJECT_PATH, IMPORT_PATH, mockTranslate);
    // then
    const projectSelectionsDir = path.join(PROJECT_PATH, '.apps/translationCore/checkData/selections', BOOK_ID);
    const importSelectionsDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/selections', BOOK_ID);
    const chapters = fs.readdirSync(projectSelectionsDir).filter(filename => parseInt(filename) > 0);
    chapters.forEach(chapter => {
      const verses = fs.readdirSync(path.join(projectSelectionsDir, chapter)).filter(filename => parseInt(filename) > 0);
      verses.forEach(verse => {
        const files = fs.readdirSync(path.join(projectSelectionsDir, chapter, verse)).filter(filename => path.extname(filename) == '.json');
        files.forEach(file => {
          const projectFilePath = path.join(projectSelectionsDir, chapter, verse, file);
          const importFilePath = path.join(importSelectionsDir, chapter, verse, file);
          expect(fs.existsSync(importFilePath)).toBeTruthy();
          expect(fs.readJsonSync(projectFilePath)).toEqual(fs.readJsonSync(importFilePath));
        });
      });
    });
  });
});

describe('ProjectMergeHelpers.createVerseEditsForAllChangedVerses() tests', () => {

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });

  it('createVerseEditsForAllChangedVerses() - tests verseEdits created for Titus 3:1', () => {
    // given
    const projectZipFile = 'project_' + PROJECT_NAME + '.zip';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm3_verse_edit.zip';
    const expectedVerseEdits = 1;
    const expectedVerseAfter = 'Remind them to submit to rulers and auuuuuuthorities, to obey them, to be ready for every good work,';
    setupProjectDir(projectZipFile);
    setupImportDir(importZipFile);
    // when
    ProjectMergeHelpers.mergeOldProjectToNewProject(PROJECT_PATH, IMPORT_PATH, mockTranslate);
    ProjectMergeHelpers.createVerseEditsForAllChangedVerses(PROJECT_PATH, IMPORT_PATH, USER_NAME);
    // then
    const verseEditsDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/verseEdits', BOOK_ID, '3', '1');
    const verseEdits = fs.readdirSync(verseEditsDir).filter(filename => path.extname(filename) == '.json').sort().reverse();
    expect(verseEdits.length).toEqual(expectedVerseEdits);
    const verseEdit = fs.readJsonSync(path.join(verseEditsDir, verseEdits[0]));
    expect(verseEdit.verseAfter).toEqual(expectedVerseAfter);
  });

  it('createInvalidatedsForAllCheckData() - tests invalidated created for changed verses', () => {
    // given
    const projectZipFile = 'project_' + PROJECT_NAME + '.zip';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm3_verse_edit.zip';
    const expectedInvalidateds = 1;
    const expectedInvalidatedReference = {
      bookId: BOOK_ID,
      chapter: 3,
      verse: 1
    };
    setupProjectDir(projectZipFile);
    setupImportDir(importZipFile);
    // when
    ProjectMergeHelpers.mergeOldProjectToNewProject(PROJECT_PATH, IMPORT_PATH, mockTranslate);
    ProjectMergeHelpers.createInvalidatedsForAllCheckData(PROJECT_PATH, IMPORT_PATH, USER_NAME);
    // then
    const invalidatedDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/invalidated', BOOK_ID, '3', '1');
    const invalidateds = fs.readdirSync(invalidatedDir).filter(filename => path.extname(filename) == '.json').sort().reverse();
    expect(invalidateds.length).toEqual(expectedInvalidateds);
    const invalidated = fs.readJsonSync(path.join(invalidatedDir, invalidateds[0]));
    expect(invalidated.contextId.reference).toEqual(expectedInvalidatedReference);
  });
});

// Helpers

function setupProjectDir(zipFile) {
  const projectZipPath = path.join(__dirname, 'fixtures/projectReimport', zipFile);
  loadZipIntoMockFs(projectZipPath, PROJECTS_PATH);
}

function setupImportDir(zipFile) {
  const importZipPath = path.join(__dirname, 'fixtures/projectReimport', zipFile);
  loadZipIntoMockFs(importZipPath, IMPORTS_PATH);
}

function loadZipIntoMockFs(zipPath, mockDestinationFolder) {
  const tmpobj = tmp.dirSync({unsafeCleanup: true});
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tmpobj.name, true);
  fs.__loadDirIntoMockFs(tmpobj.name, mockDestinationFolder);
  tmpobj.removeCallback();
}
