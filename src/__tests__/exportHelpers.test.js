/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
// helpers
import * as exportHelpers from '../js/helpers/exportHelpers';
// constants
import { PROJECTS_PATH } from '../js/common/constants';

describe('exportHelpers.getUsfmExportName', () => {
  it('should get the name of a titus project according to the standard', () => {
    const manifest = { project: { id: 'tit' } };
    const expectedFileName = '57-TIT';
    const projectName = exportHelpers.getUsfmExportName(manifest);
    expect(projectName).toBe(expectedFileName);
  });
  it('shouldn\'t get the name of a titus project if the manifest is missing', () => {
    const manifest = { project: {} };
    const projectName = exportHelpers.getUsfmExportName(manifest);
    expect(projectName).toBe(undefined);
  });
});

describe('exportHelpers.getHeaderTags', () => {
  const bookName = 'tit';
  const project_name = `en_${bookName}`;
  const projectSaveLocation = path.join(PROJECTS_PATH, project_name);

  beforeEach(() => {
    const sourcePath = path.join('src', '__tests__', 'fixtures', 'project');
    const copyFiles = [project_name];
    fs.__resetMockFS();
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
  });
  afterEach(() => {
    fs.__resetMockFS();
  });
  it('should get the usfm header of a titus project according to the standard', () => {
    const expectedResult = 'TIT N/A en_English_ltr Not-a-real-date tc';
    const header = exportHelpers.getHeaderTags(projectSaveLocation);
    expect(header[0].content).toBe(expectedResult);
  });

  it('should preserve old header id tag', () => {
    const preservedIDContent = 'unfoldingWord Literal Text';
    fs.writeJSONSync(path.join(projectSaveLocation, bookName, 'headers.json'), [{ 'tag':'id', 'content':`2TI ${preservedIDContent}` }]);
    const headers = exportHelpers.getHeaderTags(projectSaveLocation);
    expect(headers[0].content.includes(preservedIDContent)).toBeTruthy();
  });
});

