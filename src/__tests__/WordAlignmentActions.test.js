import configureMockStore from 'redux-mock-store';
import path from 'path-extra';
import thunk from 'redux-thunk';
import fs from 'fs-extra';
// actions
import * as actions from '../js/actions/WordAlignmentActions';
import * as WordAlignmentHelpers from '../js/helpers/WordAlignmentHelpers';
// constants
import {
  PROJECTS_PATH, USER_RESOURCES_PATH, STATIC_RESOURCES_PATH,
} from '../js/common/constants';
jest.mock('../js/helpers/Repo');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('WordAlignmentActions.getUsfm3ExportFile', () => {
  let store;
  const projectName = 'invalidatedAlignments';

  beforeEach(() => {
    store = mockStore({});
    // reset mock filesystem data
    fs.__resetMockFS();
    const sourcePath = path.join(__dirname, 'fixtures/project/wordAlignment');
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');
    const copyResourceFiles = [
      'en/bibles/ult',
      'el-x-koine/bibles/ugnt',
    ];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, STATIC_RESOURCES_PATH);
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, USER_RESOURCES_PATH);
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
    expect(res.split('zaln-s').length).toBe(116);
  }, 30000);
});
