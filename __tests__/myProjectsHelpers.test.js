/* eslint-disable no-console */
/* eslint-env jest */
jest.mock('fs-extra');
import path from 'path';
import fs from 'fs-extra';
import * as myProjectsHelpers from '../src/js/helpers/myProjectsHelpers';

describe('myProjectsHelpers.getProjectsFromFS', () => {
  let out;
  beforeAll(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project/missingVerses');
    out = path.join(__dirname, 'output/my_projects_fs');
    fs.__loadDirIntoMockFs(sourcePath, out);
  });

  test('should get all working projects in a test home directory', () => {
    let projects = myProjectsHelpers.getProjectsFromFS('', out);
    expect(projects).toHaveLength(2);
  });
});

describe('myProjectsHelpers.getProjectsFromFS 2', () => {
  let out;
  beforeAll(() => {
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project/projectVerification');
    out = path.join(__dirname, 'output/my_projects_fs');
    fs.__loadDirIntoMockFs(sourcePath, out);
  });

  test('should get all projects in a test home directory with a manifest.json or usfm', () => {
    let projects = myProjectsHelpers.getProjectsFromFS('', out);
    expect(projects).toHaveLength(5);
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: "duplicate_books",
      bookName: "Mark"
    }));
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: "invalid_books",
      bookAbbr: undefined
    }));
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: "multibook_project_2",
      bookName: 'Revelation'
    }));
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: "obs_project_2",
      bookAbbr: 'obs'
    }));
  });
});
