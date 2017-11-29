import { downloadWinGit } from '../src/js/helpers/InstallationHelpers';
import path from 'path';

jest.mock('mkdirp');
jest.mock('fs-extra');
jest.mock('../src/js/helpers/DownloadHelpers');

describe('downloadGit', () => {
  let downloadHelper, fs;

  beforeEach(() => {
    downloadHelper = require('../src/js/helpers/DownloadHelpers');
    fs = require('fs-extra');
    jest.clearAllMocks();
    fs.__resetMockFS();
  });

  it('downloads a 32bit installer', () => {
    downloadHelper.__setFailure(undefined);
    return downloadWinGit('1.9.2', '32').then((dest) => {
      expect(dest).toMatch(/.*vendor\/Git-1\.9\.2-32-bit\.exe/);
      expect(downloadHelper.download).toBeCalled();
    });
  });

  it('downloads a 64it installer', () => {
    downloadHelper.__setFailure(undefined);
    return downloadWinGit('1.6.3', '64').then((dest) => {
      expect(dest).toMatch(/.*vendor\/Git-1\.6\.3-64-bit\.exe/);
      expect(downloadHelper.download).toBeCalled();
    });
  });

  it('bubbles up network error', () => {
    downloadHelper.__setFailure('Network Error');
    return downloadWinGit('1.6.3', '64').catch(e => expect(e).toMatch('Network Error'));
  });

  it('hits the cache', () => {
    downloadHelper.__setFailure(undefined);
    let expected_dest = path.normalize(path.join(__dirname, '../vendor/Git-1.6.3-64-bit.exe'));
    fs.writeFileSync(expected_dest, 'data');
    return downloadWinGit('1.6.3', '64').then((dest) => {
      expect(dest).toMatch(expected_dest);
      expect(downloadHelper.download).not.toBeCalled();
    });
  });
});
