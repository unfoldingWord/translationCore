import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ProjectReimportHelpers from '../src/js/helpers/Import/ProjectReimportHelpers';
import * as fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';

jest.mock('fs-extra');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECT_NAME = 'en_ulb_tit_text';
const PROJECT_PATH = path.join(ospath.home(), 'translationCore', 'projects', PROJECT_NAME);
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
const IMPORT_PATH = path.join(IMPORTS_PATH, PROJECT_NAME);

describe('Tests for ProjectReimportHelpers.preserveExistingProjectChecks()', () => {
  let initialState = {};
  let store;

  beforeEach(() => {
    initialState = {
      projectDetailsReducer: {
        projectSaveLocation: PROJECT_PATH,
        manifest: {},
        currentProjectToolsProgress: {},
        projectType: null
      },
      localImportReducer: {
        selectedProjectFilename: PROJECT_NAME
      }
    };
    store = mockStore(initialState);
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const projectRealPath = path.join(__dirname, 'fixtures/projectReimport/projects', PROJECT_NAME);
    fs.__loadDirIntoMockFs(projectRealPath, PROJECT_PATH);
  });

  const setupProjectImport = (importDirectory) => {
    const importFixturesPath = path.join(__dirname, 'fixtures/projectReimport/imports', importDirectory);
    const importPath = path.join(IMPORTS_PATH, PROJECT_NAME);
    fs.__loadDirIntoMockFs(importFixturesPath, importPath);
  };

  it('preserveExistingProjectChecks() test usfm2 import preserves all checks and alignments', () => {
    // given
    const importDirectory = PROJECT_NAME+'_usfm2';
    setupProjectImport(importDirectory);
    // when
    return store.dispatch(ProjectReimportHelpers.preserveExistingProjectChecks(PROJECT_NAME)).then(() => {
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
  }, 5000);
});
