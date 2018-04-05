/* eslint-env jest */
/* eslint-disable no-console */
jest.mock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// helpers
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';

// constants
const projectName   = 'aa_tit_text_ulb';
const IMPORTS_PATH  = path.join(ospath.home(), 'translationCore', 'imports');
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const fromPath      = path.join(IMPORTS_PATH, projectName);
const toPath        = path.join(PROJECTS_PATH, projectName);
const reimportRejectMsg = {
  "data": {
    "project_path": projectName
  },
  "message": "projects.project_exists"
};
const reimportCompoundMsg = "projects.project_exists projects.reimporting_not_supported";
const noProjectInImportsFolderRejectMsg = {
  "data": {
    "fromPath": fromPath,
    "projectName": projectName
  },
  "message": "projects.not_found"
};

describe('ProjectImportFilesystemHelpers.move',()=> {
  beforeEach(()=>{
    fs.__resetMockFS();
  });

  test('ProjectImportFilesystemHelpers.move verifies that it does not reimport a project', async () => {
    fs.__setMockFS({
      [toPath]: '',
      [fromPath]: ''
    });
    expect.assertions(1);
    //translate = {key => key};
    return expect(ProjectImportFilesystemHelpers.move(projectName, k=>k)).rejects.toEqual(reimportCompoundMsg);
    //console.log( res);
    //return res;
  });

  test('ProjectImportFilesystemHelpers.move should fail/reject if the specified project is not found in the imports folder', () => {
    expect.assertions(1);
    return expect(ProjectImportFilesystemHelpers.move(projectName, jest.fn())).rejects.toEqual(noProjectInImportsFolderRejectMsg);
  });

  test('ProjectImportFilesystemHelpers.move should move the file from imports folder to projects folder', () => {
    fs.__setMockFS({
      [fromPath]: ''
    });
    expect(fs.existsSync(toPath)).toBeFalsy();
    expect(fs.existsSync(fromPath)).toBeTruthy();
    return expect(ProjectImportFilesystemHelpers.move(projectName, jest.fn())).resolves.toBe(toPath);
  });
});

describe('ProjectImportFilesystemHelpers.projectExistsInProjectsFolder',()=> {
  beforeEach(()=>{
    fs.__resetMockFS();
  });
  const projectManifest = {
    "target_language": {
      "id": "amo",
      "name": "Amo"
    },
    "project": {
      "id": "tit",
      "name": "Titus"
    }
  };
  const uniqueManifest = {
    "target_language": {
      "id": "hi",
      "name": "Hindi"
    },
    "project": {
      "id": "tit",
      "name": "Titus"
    }
  };

  test('should verify that the given project exists in the projects folder', () => {
    fs.__setMockFS({
      [PROJECTS_PATH]:[projectName],
      [fromPath]:[],
      [toPath]:[],
      [path.join(toPath, 'manifest.json')]: projectManifest,
      [path.join(fromPath, 'manifest.json')]: projectManifest
    });
   expect(ProjectImportFilesystemHelpers.projectExistsInProjectsFolder(fromPath)).toEqual(true);
  });

  test('should verify that the given project does not exist in the projects folder', () => {
    fs.__setMockFS({
      [PROJECTS_PATH]:[projectName],
      [path.join(toPath, 'manifest.json')]: projectManifest,
      [path.join(fromPath, 'manifest.json')]: uniqueManifest
    });
   expect(ProjectImportFilesystemHelpers.projectExistsInProjectsFolder(fromPath)).toEqual(false);
  });
});
