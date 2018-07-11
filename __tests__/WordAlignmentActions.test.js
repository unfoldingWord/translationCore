import configureMockStore from 'redux-mock-store';
import git from "../src/js/helpers/GitApi"; // TRICKY: this needs to be before `import fs` so that jest mocking is set up correctly
import path from 'path-extra';
import ospath from 'ospath';
import thunk from 'redux-thunk';
import * as actions from '../src/js/actions/WordAlignmentActions';
import * as WordAlignmentHelpers from '../src/js/helpers/WordAlignmentHelpers';
import fs from 'fs-extra';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const STATIC_RESOURCE_PATH = path.join(__dirname, '../tC_resources/resources');
const USER_RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');

describe('WordAlignmentActions.getUsfm3ExportFile', () => {
  let store;
  const projectName = 'invalidatedAlignments';
  beforeEach(() => {
    store = mockStore({});
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = "__tests__/fixtures/project/wordAlignment";
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    const sourceResourcesPath = path.join('__tests__', 'fixtures', 'resources');
    const copyResourceFiles = [
      'en/bibles/ult',
      'grc/bibles/ugnt'
    ];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, STATIC_RESOURCE_PATH);
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, USER_RESOURCE_PATH);
  });
  afterAll(() => {
    fs.__resetMockFS();
  });
  it('should export a usfm file given a correct path to the project', async () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    let reset_spy = jest.spyOn(WordAlignmentHelpers,
      'resetAlignmentsForVerse');
    let convert_spy = jest.spyOn(WordAlignmentHelpers,
      'convertAlignmentDataToUSFM');
    const res = await store.dispatch(actions.getUsfm3ExportFile(projectPath, false, true));
    expect(reset_spy).toHaveBeenCalledTimes(8);
    expect(convert_spy).toHaveBeenCalledTimes(9);
    expect(res.split('zaln-s').length).toBe(121);
  });
});
