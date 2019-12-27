import path from 'path-extra';
import fs from 'fs-extra';
import Repo from '../Repo';
// helpers
import GitApi from '../GitApi';
// constants
import { PROJECTS_PATH } from '../../common/constants';
jest.unmock('../Repo');
jest.mock('../GitApi');

describe('Repo', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.ensureDirSync(PROJECTS_PATH);
    GitApi.__Reset();
  });

  it('open() should pass', async () => {
    const projectName = 'project_a';
    const dir = path.join(PROJECTS_PATH, projectName); // use this repo as a benchmark
    const user = 'dummy';
    fs.ensureDirSync(dir);
    fs.outputJSONSync(path.join(dir, 'file.json'), { data: 'stuff' });
    let exceptionThrown = false;

    try {
      await Repo.open(dir, user);
    } catch (e) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).toBeFalsy();
  });

  it('check if the directory isDirty - nothing changed', async () => {
    const projectName = 'project_a';
    const dir = path.join(PROJECTS_PATH, projectName); // use this repo as a benchmark
    const user = 'dummy';
    fs.ensureDirSync(dir);
    fs.outputJSONSync(path.join(dir, 'file.json'), { data: 'stuff' });
    let exceptionThrown = false;
    let data = null;
    let repo = null;

    try {
      repo = new Repo(dir, user);
      data = await repo.isDirty();
    } catch (e) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).toBeFalsy();
    expect(data).toBeFalsy();
    expect(repo.dir).toEqual(dir);
    expect(repo.user).toEqual(user);
  });

  it('check if the directory is isDirty - add file', async () => {
    const projectName = 'project_a';
    const dir = path.join(PROJECTS_PATH, projectName); // use this repo as a benchmark
    const user = 'dummy';
    fs.ensureDirSync(dir);
    fs.outputJSONSync(path.join(dir, 'file.json'), { data: 'stuff' });
    const mockdata = GitApi.__GetData();
    mockdata.mockStatus_Ret = { modified: ['dummyfile'] };
    let exceptionThrown = false;
    let data = null;
    let repo = null;

    try {
      repo = new Repo(dir, user);
      data = await repo.isDirty();
    } catch (e) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).toBeFalsy();
    expect(data).toBeTruthy();
    expect(repo.dir).toEqual(dir);
    expect(repo.user).toEqual(user);
  });

  it('check if the directory is isDirty - add ignored file', async () => {
    const projectName = 'project_a';
    const dir = path.join(PROJECTS_PATH, projectName); // use this repo as a benchmark
    const user = 'dummy';
    fs.ensureDirSync(dir);
    fs.outputJSONSync(path.join(dir, 'file.json'), { data: 'stuff' });
    const mockdata = GitApi.__GetData();
    const fileName = 'dummyfile';
    mockdata.mockStatus_Ret = { modified: [fileName] };
    let exceptionThrown = false;
    let data = null;
    let repo = null;

    try {
      repo = new Repo(dir, user);
      data = await repo.isDirty([fileName]);
    } catch (e) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).toBeFalsy();
    expect(data).toBeFalsy();
    expect(repo.dir).toEqual(dir);
    expect(repo.user).toEqual(user);
  });

  it('doesRemoteRepoExist', async () => {
    const url = 'http://dummy';
    let exceptionThrown = false;
    const expectedExists = true;
    let exists;

    try {
      exists = await Repo.doesRemoteRepoExist(url);
    } catch (e) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).toBeFalsy();
    expect(exists).toEqual(expectedExists);
  });
});


