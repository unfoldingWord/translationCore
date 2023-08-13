/* eslint-disable no-console */
/* eslint-env jest */
import path from 'path';
// import ncp from 'ncp';
import fs from 'fs-extra';
import * as myProjectsHelpers from '../js/helpers/myProjectsHelpers';
import { ncp } from '../js/helpers/fileUtils';
jest.unmock('fs-extra');
jest.unmock('../js/helpers/GitApi');

const cleanOutput = () => {
  const filePath = path.join(__dirname, 'output/tests/');

  try {
    fs.emptyDirSync(filePath);
  } catch (e) {
    console.error(`cleanOutput() - Could not remove ${filePath}`, e);
  }
};

afterEach(() => {
  cleanOutput();
});

describe('myProjectsHelpers.getProjectsFromFS', () => {
  let out;

  beforeAll(() => new Promise((resolve, reject) => {
    cleanOutput();
    let src = path.join(__dirname, 'fixtures', 'project', 'missingVerses');
    out = path.join(__dirname, 'output/tests','my_projects_fs');
    ncp(src, out, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }));
  test('should get all working projects in a test home directory', () => {
    let projects = myProjectsHelpers.getProjectsFromFS('', out);
    expect(projects).toHaveLength(2);
  });
});

describe('myProjectsHelpers.getProjectsFromFS 2', () => {
  let out;

  beforeAll(() => new Promise((resolve, reject) => {
    cleanOutput();
    let src = path.join(__dirname, 'fixtures', 'project', 'projectVerification');
    out = path.join(__dirname, 'output/tests', 'my_projects_fs');
    ncp(src, out, (err) => {
      if (err) {
        console.log('ncp - copy error', err);
        const files = fs.readdirSync(__dirname);
        console.log('files found', files);
        reject(err);
      } else {
        resolve();
      }
    });
  }));
  test('should get all projects in a test home directory with a manifest.json or usfm', () => {
    jest.setTimeout(30000);
    let projects = myProjectsHelpers.getProjectsFromFS('', out);
    expect(projects).toHaveLength(5);
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: 'duplicate_books',
      bookName: 'Mark',
    }));
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: 'invalid_books',
      bookAbbr: undefined,
    }));
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: 'multibook_project_2',
      bookName: 'Revelation',
    }));
    expect(projects).toContainEqual(expect.objectContaining({
      projectName: 'obs_project_2',
      bookAbbr: 'obs',
    }));
  });
});
