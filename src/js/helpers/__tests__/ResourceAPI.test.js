import fs from 'fs-extra';
import path from 'path-extra';
import ResourceAPI from '../ResourceAPI';
// constants
import { TRANSLATION_HELPS } from '../../common/constants';
jest.mock('fs-extra');

describe('ResourceAPI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('provides paths', () => {
    const r = new ResourceAPI('/root');
    expect(r.path).toEqual('/root');
  });

  it('lists translation helps', () => {
    const r = new ResourceAPI('/root');
    fs.readdirSync.mockReturnValueOnce(['test']);

    expect(r.getTranslationHelps('lang')).toEqual(['test']);
    expect(fs.readdirSync).toBeCalledWith(path.join(path.sep, 'root', 'lang', TRANSLATION_HELPS));
  });

  describe('get latest translation help', () => {
    it('has latest', () => {
      const r = new ResourceAPI('/root');

      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readdirSync.mockReturnValueOnce(['v1', 'v2', 'v10', 'v9']);
      fs.lstatSync.mockReturnValue({ isDirectory: () => true });

      const result = r.getLatestTranslationHelp('lang', 'tw');
      expect(result).toContain(path.join('root', 'lang', TRANSLATION_HELPS, 'tw', 'v10'));
    });

    it('has latest with floats', () => {
      const r = new ResourceAPI('/root');

      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readdirSync.mockReturnValueOnce(['v1.1', 'v2.1', 'v10.10', 'v10.2', 'v9.1']);
      fs.lstatSync.mockReturnValue({ isDirectory: () => true });

      const result = r.getLatestTranslationHelp('lang', 'tw');
      expect(result).toContain(path.join('root', 'lang', TRANSLATION_HELPS, 'tw', 'v10.10'));
    });

    it('does not have any', () => {
      const r = new ResourceAPI('/root');

      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readdirSync.mockReturnValueOnce([]);
      fs.lstatSync.mockReturnValue({ isDirectory: () => true });

      const result = r.getLatestTranslationHelp('lang', 'tw');
      expect(result).toEqual(null);
    });

    it('is missing help', () => {
      const r = new ResourceAPI('/root');

      fs.pathExistsSync.mockReturnValueOnce(false);

      const result = r.getLatestTranslationHelp('lang', 'tw');
      expect(result).toEqual(null);
    });
  });
});
