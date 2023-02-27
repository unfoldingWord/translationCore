import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import Repo, {
  createNewBranch,
  getCurrentBranch,
  getDefaultBranch,
} from '../js/helpers/Repo';
import {exec} from "child_process";

jest.unmock('simple-git');
jest.unmock('fs-extra');

const importsFolder = path.join(ospath.home(), 'translationCore', 'imports');
const tempFolder = path.join(importsFolder, 'tempFolder');
const repoFolder = path.join(tempFolder, 'tempRepo');

describe('testing git branch operations', () => {
  beforeEach(() => {
    if (fs.existsSync(tempFolder)) {
      fs.removeSync(tempFolder);

      if (fs.existsSync(tempFolder)) {
        console.error(`not deleted ${tempFolder}`);
      }
    }
    fs.ensureDirSync(repoFolder);
    fs.writeJsonSync(path.join(repoFolder, 'stuff.json'), { stuff: 'stuff' });
  });

  afterEach(() => {
    if (fs.existsSync(tempFolder)) {
      fs.removeSync(tempFolder);
    }
  });

  it('git should be installed', async () => {
    const version = await getGitVersion();
    console.log('git version:', version);
    expect(version).toBeTruthy();
  });

  it('git default init - should be error before first commit', async () => {
    await Repo.init(repoFolder);
    let { results, noCommitsYet } = await getDefaultBranch(repoFolder);
    expect(noCommitsYet).toBeTruthy();
    expect(results).toEqual(null);
  });

  it('git default init - should not be error after first commit', async () => {
    const expectedDefaultRepo = 'master';
    const repo = await Repo.open(repoFolder);
    await repo.save('testing first save');
    let { results, noCommitsYet } = await getDefaultBranch(repoFolder);
    expect(repo.dir).toEqual(repoFolder);
    expect(noCommitsYet).toBeFalsy();
    expect(results).toEqual(expectedDefaultRepo);
  });

  it('git init with default of main - should not be error after first commit', async () => {
    const expectedDefaultRepo = 'main';
    await Repo.init(repoFolder, { '--initial-branch': expectedDefaultRepo });
    const repo = await Repo.open(repoFolder);
    await repo.save('testing first save');
    let { results, noCommitsYet } = await getDefaultBranch(repoFolder);
    expect(repo.dir).toEqual(repoFolder);
    expect(noCommitsYet).toBeFalsy();
    expect(results).toEqual(expectedDefaultRepo);
  });

  it('git openSafe with default of main - should rename to master branch', async () => {
    const expectedDefaultRepo = 'main';
    const expectedfinalRepo = 'master';
    const repo = await Repo.openSafe(repoFolder, { '--initial-branch': expectedDefaultRepo });
    const currentBr = await getCurrentBranch(repoFolder);
    const currentBranch = currentBr.current;
    expect(repo).toBeTruthy();
    expect(currentBranch).toEqual(expectedfinalRepo);
  });

  it('git openSafe with default of master - should not rename to master branch', async () => {
    const expectedfinalRepo = 'master';
    await Repo.init(repoFolder);
    const repo = await Repo.openSafe(repoFolder);
    const currentBr = await getCurrentBranch(repoFolder);
    const currentBranch = currentBr.current;
    expect(repo).toBeTruthy();
    expect(currentBranch).toEqual(expectedfinalRepo);
  });

  it('git openSafe with both master and main - should change to master branch', async () => {
    const expectedfinalRepo = 'master';
    await Repo.init(repoFolder);
    let repo = await Repo.open(repoFolder);
    await repo.save('setup for testing');
    const extraBranch = 'main';
    await createNewBranch(repoFolder, extraBranch); // create a main branch and checkout
    let currentBr = await getCurrentBranch(repoFolder);
    expect(currentBr.current).toEqual(extraBranch);
    repo = await Repo.openSafe(repoFolder);
    currentBr = await getCurrentBranch(repoFolder);
    const currentBranch = currentBr.current;
    expect(repo).toBeTruthy();
    expect(currentBranch).toEqual(expectedfinalRepo);
  });
});

const getGitVersion = () => new Promise((resolve, reject) => {
  exec('git - c', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(!!data);
    }
  });
});
