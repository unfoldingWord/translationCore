import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ProjectReimportHelpers from '../src/js/helpers/Import/ProjectReimportHelpers';
import * as fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';

jest.mock('fs-extra');
jest.unmock('adm-zip');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECT_NAME = 'en_ulb_tit_text';
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const PROJECT_PATH = path.join(PROJECTS_PATH, PROJECT_NAME);
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const IMPORT_PATH = path.join(IMPORTS_PATH, PROJECT_NAME);

describe('Tests for ProjectReimportHelpers', () => {

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const projectZipPath = path.join(__dirname, 'fixtures/projectReimport', 'project_' + PROJECT_NAME + '.zip');
    fs.__loadZipIntoMockFs(projectZipPath, PROJECTS_PATH);
  });

  const setupProjectImport = (importZipFile) => {
    const importZipPath = path.join(__dirname, 'fixtures/projectReimport', importZipFile);
    fs.__loadZipIntoMockFs(importZipPath, IMPORTS_PATH);
  };

  it('preserveExistingProjectChecks() test project does not exist', () => {
    // given
    const projectName = 'bad_project_name';
    const expectedError = 'projects.project_does_not_exist projects.import_again_as_new_project';
    // then
    expect(() => ProjectReimportHelpers.preserveExistingProjectChecks(projectName, key=>key)).toThrowError(expectedError);
  });

  it('preserveExistingProjectChecks() test usfm2 import preserves all checks and alignments', () => {
    // given
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm2.zip';
    setupProjectImport(importZipFile);
    // when
    ProjectReimportHelpers.preserveExistingProjectChecks(PROJECT_NAME);
    // then
    const projectSelectionsDir = path.join(PROJECT_PATH, '.apps/translationCore/checkData/selections/tit');
    const importSelectionsDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/selections/tit');
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

  it('preserveExistingProjectChecks() test usfm3 import preserves all checks', () => {
    // given
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm3.zip';
    setupProjectImport(importZipFile);
    // when
    ProjectReimportHelpers.preserveExistingProjectChecks(PROJECT_NAME);
    // then
    const projectSelectionsDir = path.join(PROJECT_PATH, '.apps/translationCore/checkData/selections/tit');
    const importSelectionsDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/selections/tit');
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

  it('createVerseEditsForAllChangedVerses() - tests verseEdits created for Titus 3:1', () => {
    // given
    const userName = 'richmahn';
    const bookId = 'tit';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm3_verse_edit.zip';
    setupProjectImport(importZipFile);
    const expectedVerseEdits = 1;
    const expectedVerseAfter = 'Remind them to submit to rulers and auuuuuuthorities, to obey them, to be ready for every good work,';
    // when
    ProjectReimportHelpers.preserveExistingProjectChecks(PROJECT_NAME, key => key);
    ProjectReimportHelpers.createVerseEditsForAllChangedVerses(PROJECT_NAME, bookId, userName);
    // then
    const verseEditsDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/verseEdits/tit/3/1');
    const verseEdits = fs.readdirSync(verseEditsDir).filter(filename => path.extname(filename) == '.json').sort().reverse();
    expect(verseEdits.length).toEqual(expectedVerseEdits);
    const verseEdit = fs.readJsonSync(path.join(verseEditsDir, verseEdits[0]));
    expect(verseEdit.verseAfter).toEqual(expectedVerseAfter);
  });

  it('createInvalidatedsForAllCheckData() - tests invalidated created for changed verses', () => {
    // given
    const userName = 'richmahn';
    const bookId = 'tit';
    const importZipFile = 'import_' + PROJECT_NAME + '_usfm3_verse_edit.zip';
    setupProjectImport(importZipFile);
    const expectedInvalidateds = 1;
    const expectedInvalidatedReference = {
      bookId: 'tit',
      chapter: 3,
      verse: 1
    };
    // when
    ProjectReimportHelpers.preserveExistingProjectChecks(PROJECT_NAME, key => key);
    ProjectReimportHelpers.createInvalidatedsForAllCheckData(PROJECT_NAME, bookId, userName);
    // then
    const invalidatedDir = path.join(IMPORT_PATH, '.apps/translationCore/checkData/invalidated/tit/3/1');
    const invalidateds = fs.readdirSync(invalidatedDir).filter(filename => path.extname(filename) == '.json').sort().reverse();
    expect(invalidateds.length).toEqual(expectedInvalidateds);
    const invalidated = fs.readJsonSync(path.join(invalidatedDir, invalidateds[0]));
    expect(invalidated.contextId.reference).toEqual(expectedInvalidatedReference);
  });
});
