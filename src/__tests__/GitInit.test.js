import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import Repo, {
  getDefaultBranch,
  makeSureCurrentBranchHasName,
} from '../js/helpers/Repo';

jest.unmock('simple-git');
jest.unmock('fs-extra');

const importsFolder = path.join(ospath.home(), 'translationCore', 'imports');
const tempFolder = path.join(importsFolder, 'tempFolder');
const repoFolder = path.join(tempFolder, 'tempRepo');

describe('testing branch operations', () => {
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

  it('check default init - should be error before first commit', async () => {
    const repo = await Repo.open(repoFolder);
    let { results, noCommitsYet } = await getDefaultBranch(repoFolder);
    expect(repo.dir).toEqual(repoFolder);
    expect(noCommitsYet).toBeTruthy();
    expect(results).toEqual(null);
  });

  it('check default init - should not be error after first commit', async () => {
    const expectedDefaultRepo = 'master';
    const repo = await Repo.open(repoFolder);
    await repo.save('testing first save');
    let { results, noCommitsYet } = await getDefaultBranch(repoFolder);
    expect(repo.dir).toEqual(repoFolder);
    expect(noCommitsYet).toBeFalsy();
    expect(results).toEqual(expectedDefaultRepo);
  });

  it('check init with default of main - should not be error after first commit', async () => {
    const expectedDefaultRepo = 'main';
    await Repo.init(repoFolder, { '--initial-branch': expectedDefaultRepo });
    const repo = await Repo.open(repoFolder);
    await repo.save('testing first save');
    let { results, noCommitsYet } = await getDefaultBranch(repoFolder);
    expect(repo.dir).toEqual(repoFolder);
    expect(noCommitsYet).toBeFalsy();
    expect(results).toEqual(expectedDefaultRepo);
  });

  it('check init with default of main - should rename to master branch', async () => {
    const expectedDefaultRepo = 'main';
    const expectedfinalRepo = 'master';
    await Repo.init(repoFolder, { '--initial-branch': expectedDefaultRepo });
    let ensureBr = await makeSureCurrentBranchHasName(repoFolder, expectedfinalRepo);
    expect(ensureBr.success).toBeTruthy();
    expect(ensureBr.error).toBeFalsy();
    expect(ensureBr.renamed).toBeTruthy();
  });

  it('check init with default of master - should not rename to master branch', async () => {
    const expectedfinalRepo = 'master';
    await Repo.init(repoFolder);
    let ensureBr = await makeSureCurrentBranchHasName(repoFolder, expectedfinalRepo);
    expect(ensureBr.success).toBeTruthy();
    expect(ensureBr.error).toBeFalsy();
    expect(ensureBr.renamed).toBeFalsy();
  });
});
