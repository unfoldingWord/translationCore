import fs from 'fs-extra';
import path from 'path-extra';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import * as ProjectOverwriteHelpers from '../js/helpers/ProjectOverwriteHelpers';
// constants
import { PROJECTS_PATH, IMPORTS_PATH } from '../js/common/constants';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const BOOK_ID = 'tit';
const PROJECT_NAME = 'en_ulb_' + BOOK_ID + '_text';
const PROJECT_PATH = path.join(PROJECTS_PATH, PROJECT_NAME);
const IMPORT_PATH = path.join(IMPORTS_PATH, PROJECT_NAME);

const mockTranslate = key => key;

describe('ProjectOverwriteHelpers.mergeOldProjectToNewProject() tests', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  afterEach(() => {
    fs.__resetMockFS();
  });

  it('mergeOldProjectToNewProject() test usfm2 import preserves all checks and alignments', () => {
    const mockDispatch = jest.fn(() => {});
    // given
    const projectFixturePath = path.join(__dirname, 'fixtures/projectReimport', 'project_'+PROJECT_NAME, PROJECT_NAME);
    const importFixturePath = path.join(__dirname, 'fixtures/projectReimport', 'import_'+PROJECT_NAME+'_usfm2', PROJECT_NAME);
    fs.__loadDirIntoMockFs(projectFixturePath, path.join(PROJECTS_PATH, PROJECT_NAME));
    fs.__loadDirIntoMockFs(importFixturePath, path.join(IMPORTS_PATH, PROJECT_NAME));
    // when
    ProjectOverwriteHelpers.mergeOldProjectToNewProject(PROJECT_PATH, IMPORT_PATH, mockTranslate, mockDispatch);
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
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('mergeOldProjectToNewProject() test usfm3 import preserves all checks', () => {
    // given
    const mockDispatch = jest.fn(() => {});
    const projectFixturePath = path.join(__dirname, 'fixtures/projectReimport', 'project_'+PROJECT_NAME, PROJECT_NAME);
    const importFixturePath = path.join(__dirname, 'fixtures/projectReimport', 'import_'+PROJECT_NAME+'_usfm3', PROJECT_NAME);
    fs.__loadDirIntoMockFs(projectFixturePath, path.join(PROJECTS_PATH, PROJECT_NAME));
    fs.__loadDirIntoMockFs(importFixturePath, path.join(IMPORTS_PATH, PROJECT_NAME));
    // when
    ProjectOverwriteHelpers.mergeOldProjectToNewProject(PROJECT_PATH, IMPORT_PATH, mockTranslate, mockDispatch);
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
    expect(mockDispatch).toHaveBeenCalled();
  });
});

describe('ProjectOverwriteHelpers.createVerseEditsForAllChangedVerses() tests', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });

  it('createVerseEditsForAllChangedVerses() with one verse edit', () => {
    const projectFixturePath = path.join(__dirname, 'fixtures/projectReimport', 'project_'+PROJECT_NAME, PROJECT_NAME);
    const importFixturePath = path.join(__dirname, 'fixtures/projectReimport', 'import_'+PROJECT_NAME+'_usfm2', PROJECT_NAME);
    fs.__loadDirIntoMockFs(projectFixturePath, path.join(PROJECTS_PATH, PROJECT_NAME));
    fs.__loadDirIntoMockFs(importFixturePath, path.join(IMPORTS_PATH, PROJECT_NAME));
    const store = mockStore({});
    store.dispatch(ProjectOverwriteHelpers.createVerseEditsForAllChangedVerses(PROJECT_PATH, IMPORT_PATH));
    const expectedVerseEditsCount = 1;
    const expectedVerseBefore = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness,';
    const expectedVerseAfter = 'Paul, a slave of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness,';
    const verseEditsPath = path.join(IMPORT_PATH, '.apps', 'translationCore', 'checkData', 'verseEdits', 'tit', '1', '1');
    const verseEditFiles = fs.readdirSync(verseEditsPath);
    expect(verseEditFiles.length).toEqual(expectedVerseEditsCount);
    const verseEdit = fs.readJsonSync(path.join(verseEditsPath, verseEditFiles[0]));
    expect(verseEdit['verseBefore']).toEqual(expectedVerseBefore);
    expect(verseEdit['verseAfter']).toEqual(expectedVerseAfter);
    expect(verseEdit.contextId.tool).toEqual('[External edit]');
  });
});
