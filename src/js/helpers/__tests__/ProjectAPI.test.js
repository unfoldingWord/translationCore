/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
import ProjectAPI from '../ProjectAPI';
// constants
import { APP_VERSION } from '../../common/constants';
jest.mock('fs-extra');

describe('ProjectAPI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('provides paths', () => {
    const p = new ProjectAPI('/root');
    expect(p.path).toEqual('/root');
    expect(p.dataPath).toContain(path.join('root', '.apps', 'translationCore'));
    fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
    expect(p.getCategoriesDir('tool')).toContain(path.join('root', '.apps', 'translationCore', 'index', 'tool', 'book'));
  });

  describe('get group data', () => {
    it('returns group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({ isDirectory: () => true });
      fs.readdirSync.mockReturnValueOnce(['file1.json', 'file2.json', 'something.else']);
      fs.readJsonSync.mockReturnValueOnce([{ hello: 'world1' }]);
      fs.readJsonSync.mockReturnValueOnce([{ hello: 'world2' }]);

      expect(p.getGroupsData('tool')).toEqual({
        file1: [
          { hello: 'world1' },
        ],
        file2: [
          { hello: 'world2' },
        ],
      });
    });

    it('handles missing check data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({ isDirectory: () => true });
      fs.readdirSync.mockReturnValueOnce(['file1.json', 'something.else']);
      fs.readJsonSync.mockReturnValueOnce([{
        hello: 'world1',
        selections: true,
        contextId: {
          reference: {
            bookId: 'tit',
            chapter: 1,
            verse: 15,
          },
          tool: 'translationWords',
          groupId: 'purify',
          quote: 'καθαροῖς',
          strong: [ 'G25130' ],
          occurrence: 1,
        },
      }]);
      fs.existsSync.mockReturnValueOnce(false);

      expect(p.getGroupsData('tool')).toEqual({
        file1: [
          {
            hello: 'world1',
            selections: false,
            contextId: {
              reference: {
                bookId: 'tit',
                chapter: 1,
                verse: 15,
              },
              tool: 'translationWords',
              groupId: 'purify',
              quote: 'καθαροῖς',
              strong: [ 'G25130' ],
              occurrence: 1,
            },
          },
        ],
      });
    });

    it('returns empty group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({ isDirectory: () => false });// groups data dir does not exist
      fs.readdirSync.mockReturnValueOnce(['file1.json', 'file2.json', 'something.else']);
      fs.readJsonSync.mockReturnValueOnce({ hello: 'world1' });
      fs.readJsonSync.mockReturnValueOnce({ hello: 'world2' });

      expect(p.getGroupsData('tool')).toEqual({});
    });
  });

  describe('check if category is loaded', () => {
    it('is loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({ loaded: ['category'] });
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(true);
      expect(fs.outputJsonSync).not.toBeCalled();
      expect(console.warn).not.toBeCalled();
    });

    it('is not loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({ loaded: [] }); // category is not loaded
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync).not.toBeCalled();
      expect(console.warn).not.toBeCalled();
    });

    it('has not been initialized', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false); // meta data file does not exist
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync.mock.calls.length).toBe(1);
      expect(console.warn).not.toBeCalled();
    });

    it('is corrupt', () => {
      const p = new ProjectAPI('/root');
      global.console = { warn: jest.fn() };
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {
        throw new Error();
      }); // category is not loaded
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync.mock.calls.length).toBe(1);
      expect(console.warn).toBeCalled();
    });
  });

  describe('set category loaded', () => {
    const manifest = { 'modified':'2019-05-10T17:13:50.393Z','tc_version':APP_VERSION };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('adds loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({ current: [], loaded: ['other'] }).mockReturnValueOnce(manifest);

      p.setCategoryLoaded('tool', 'category');
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        {
          'current': [], 'loaded': ['other', 'category'], 'timestamp': manifest.modified,
        }, { 'spaces': 2 });
    });

    it('removes loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({ current: [], loaded: ['category', 'other'] }).mockReturnValueOnce(manifest);

      p.setCategoryLoaded('tool', 'category', false);
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        {
          'current': [], 'loaded': ['other'], 'timestamp': manifest.modified,
        }, { 'spaces': 2 });
    });

    it('rebuilds missing file', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false); // metadata file is missing
      fs.readJsonSync.mockReturnValueOnce(manifest);

      p.setCategoryLoaded('tool', 'category');
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        {
          'current': [], 'loaded': ['category'], 'timestamp': manifest.modified,
        }, { 'spaces': 2 });
    });

    it('rebuilds corrupt file', () => {
      const p = new ProjectAPI('/root');
      global.console = { warn: jest.fn() };
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {
        fs.readJsonSync.mockRestore();
        fs.readJsonSync.mockReturnValueOnce(manifest); // set return
        throw new Error();
      });
      p.setCategoryLoaded('tool', 'category');

      expect(console.warn).toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        {
          'current': [], 'loaded': ['category'], 'timestamp': manifest.modified,
        }, { 'spaces': 2 });
    });
  });

  describe('get selected categories', () => {
    it('has selected', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({ current: ['category'] });

      expect(p.getSelectedCategories('tool')).toEqual(['category']);
      expect(console.warn).not.toBeCalled();
    });

    it('with parent', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValue(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValue(true);
      fs.readJsonSync.mockReturnValueOnce({ current: ['category'] });
      fs.readdirSync.mockReturnValueOnce(['parent.json']);
      fs.readJsonSync.mockReturnValueOnce(['category', 'category2']);

      expect( p.getSelectedCategories('tool', true)).toMatchObject({ parent:['category'] });
      expect(console.warn).not.toBeCalled();
    });

    it('is missing file', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false);

      expect(p.getSelectedCategories('tool')).toEqual([]);
      expect(console.warn).not.toBeCalled();
    });

    it('has corrupt file', () => {
      const p = new ProjectAPI('/root');

      global.console = { warn: jest.fn() };
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {
        throw new Error();
      });

      expect(p.getSelectedCategories('tool')).toEqual([]);
      expect(console.warn).toBeCalled();
    });
  });

  describe('set selected categories', () => {
    it('sets selected', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({ current: ['other'], loaded: [] });

      p.setSelectedCategories('tool', ['category']);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        { 'current': ['category'], 'loaded': [] },
        { 'spaces': 2 },
      );
      expect(console.warn).not.toBeCalled();
    });

    it('is missing file', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false);

      p.setSelectedCategories('tool', ['category']);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        {
          'current': ['category'], 'loaded': [], 'timestamp': expect.any(String),
        },
        { 'spaces': 2 },
      );
      expect(console.warn).not.toBeCalled();
    });

    it('has corrupt file', () => {
      const p = new ProjectAPI('/root');

      global.console = { warn: jest.fn() };
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {
        throw new Error();
      });

      p.setSelectedCategories('tool', ['category']);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, 'root', '.apps', 'translationCore', 'index', 'tool', 'book', '.categories'),
        {
          'current': ['category'], 'loaded': [], 'timestamp': expect.any(String),
        },
        { 'spaces': 2 },
      );
      expect(console.warn).toBeCalled();
    });
  });

  describe('hasNewGroupsData()', () => {
    const manifest_ = { 'modified':'2019-05-10T17:13:50.393Z','tc_version':APP_VERSION };
    const categories_ = {
      'current':['kt','names','other'],'loaded':['kt','names','other'],'timestamp':'2019-05-10T17:13:50.393Z',
    };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('same date does not need updating', () => {
      // given
      const expectHasNewGroupsData = false;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('older categories timestamp needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      categories.timestamp = '2019-05-10T17:13:50.300Z';
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('newer categories timestamp needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      categories.timestamp = '2019-05-10T17:13:50.400Z';
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('missing categories timestamp needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      delete categories.timestamp;
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });

    it('missing updater manifest modified time needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      delete manifest.modified;
      const categories = { ...categories_ };
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });
    it('missing categories file needs updating', () => {
      // given
      const expectHasNewGroupsData = true;
      const p = new ProjectAPI('/root');
      p.getBookId = jest.fn(() => ('tit'));
      const manifest = { ...manifest_ };
      const categories = { ...categories_ };
      fs.pathExistsSync.mockReturnValueOnce(false);
      fs.readJsonSync.mockReturnValueOnce(categories).mockReturnValueOnce(manifest);

      // when
      const results = p.hasNewGroupsData('tool');

      // then
      expect(results).toEqual(expectHasNewGroupsData);
    });
  });

  describe('getParentCategory()', () => {
    it('parent category exists for groupId', () => {
      const p = new ProjectAPI('/root');

      p.getAllCategoryMapping = jest.fn(() => ({ 'name1': ['groupId1', 'groupId2'] }));

      const expectedParentCategory = 'name1';
      const parentCategory = p.getParentCategory('tool', 'groupId2');
      expect(parentCategory).toEqual(expectedParentCategory);
      jest.resetAllMocks();
    });

    it('parent category does not exist for groupId', () => {
      const p = new ProjectAPI('/root');

      p.getAllCategoryMapping = jest.fn(() => ({ 'name1': ['groupId1', 'groupId2'] }));

      const parentCategory = p.getParentCategory('tool', 'groupId3');
      expect(parentCategory).toBeUndefined();
      jest.resetAllMocks();
    });
  });
});
