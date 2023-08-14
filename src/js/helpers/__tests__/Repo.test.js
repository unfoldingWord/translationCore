import path from 'path-extra';
import Repo, { isMatched } from '../Repo';
import { DCS_BASE_URL } from '../../common/constants';

jest.unmock('fs-extra');
jest.unmock('simple-git');
jest.unmock('../GitApi');

describe('static methods', () => {
  it('should return the project name of a git.door43.org link with \'.git\' extension', () => {
    let url = DCS_BASE_URL + '/richmahn/en_tit_ulb.git';
    let projectName = Repo.parseRemoteUrl(url);

    expect(projectName).toEqual({
      'full_name': 'richmahn/en_tit_ulb',
      'host': DCS_BASE_URL + '/',
      'name': 'en_tit_ulb',
      'owner': 'richmahn',
      url,
    });
  });
  it('should return the project name of a git.door43.org link without \'.git\' extension', () => {
    let url = DCS_BASE_URL + '/richmahn/en_tit_ulb';
    let projectName = Repo.parseRemoteUrl(url);

    expect(projectName).toEqual({
      'full_name': 'richmahn/en_tit_ulb',
      'host': DCS_BASE_URL + '/',
      'name': 'en_tit_ulb',
      'owner': 'richmahn',
      url,
    });
  });

  it('check if the directory is isDirty', async () => {
    const dir = path.join(__dirname, '../../../../'); // use this repo as a benchmark
    console.log('dirty folder path', dir);
    const user = 'dummy';
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
    expect(typeof data).toEqual('boolean');
    expect(repo.dir).toEqual(dir);
    expect(repo.user).toEqual(user);
  });

  it('check if the directory is a git repo', async () => {
    const dir = path.join(__dirname, '../../../../'); // use this repo as a benchmark
    expect(await Repo.isRepo(dir)).toEqual(true);
    expect(await Repo.isRepo('missing')).toEqual(false);
  });

  it('checks if a string matches expressions', () => {
    const result = isMatched('/path/to/contextId.json', ['.*/contextId.json']);
    expect(result).toBeTruthy();
  });

  it('checks if a string matches path', () => {
    const result = isMatched('/path/to/contextId.json', ['/path/to/contextId.json']);
    expect(result).toBeTruthy();
  });

  it('checks if a string does not match an expression', () => {
    const result = isMatched('/path/to/contextId.json', ['/something.json']);
    expect(result).not.toBeTruthy();
  });
});

describe('sanitize remote url', () => {
  it('should return the git.door43.org for a live.door43.org link', () => {
    let url = 'https://live.door43.org/u/richmahn/en_tit_ulb/120df21085/';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = DCS_BASE_URL + '/richmahn/en_tit_ulb.git';
    expect(gitUrl).toBe(expectedUrl);
  });

  it('should return the git.door43.org for a www.door43.org link', () => {
    let url = 'https://www.door43.org/u/richmahn/en_tit_ulb/120df21085/';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = DCS_BASE_URL + '/richmahn/en_tit_ulb.git';
    expect(gitUrl).toBe(expectedUrl);
  });

  it('should return the git.door43.org for a door43.org link', () => {
    let url = 'https://www.door43.org/u/richmahn/en_tit_ulb/';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = DCS_BASE_URL + '/richmahn/en_tit_ulb.git';
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return the git.door43.org for a git.door43.org link', () => {
    let url = '   ' + DCS_BASE_URL + '/richmahn/en_tit_ulb   ';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = DCS_BASE_URL + '/richmahn/en_tit_ulb.git';
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return an empty string for a bad link', () => {
    let url = 'https://bad.door43.org/u/richmahn/en_tit_ulb';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = null;
    expect(gitUrl).toEqual(expectedUrl);
  });

  it('should return an empty string for an invalid project link', () => {
    let url = DCS_BASE_URL + '/richmahn/en_tit_ulb/stuff';
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = null;
    expect(gitUrl).toEqual(expectedUrl);
  });
});
