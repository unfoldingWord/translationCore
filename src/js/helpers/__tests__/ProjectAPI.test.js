jest.mock('fs-extra');
import fs from 'fs-extra';
import path from "path-extra";
import ProjectAPI from "../ProjectAPI";

describe('ProjectAPI', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('provides paths', () => {
    const p = new ProjectAPI('/root');
    expect(p.path).toEqual('/root');
    expect(p.dataPath).toContain(path.join("root", ".apps", "translationCore"));
    fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
    expect(p.getCategoriesDir('tool')).toContain(path.join("root", ".apps", "translationCore", "index", "tool", "book"));
  });

  describe('get group data', () => {
    it('returns group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({
        isDirectory: () => true
      });
      fs.readdirSync.mockReturnValueOnce(["file1.json", "file2.json", "something.else"]);
      fs.readJsonSync.mockReturnValueOnce({hello: "world1"});
      fs.readJsonSync.mockReturnValueOnce({hello: "world2"});

      expect(p.getGroupsData('tool')).toEqual({
        file1: {
          hello: "world1"
        },
        file2: {
          hello: "world2"
        }
      });
    });

    it('returns empty group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.lstatSync.mockReturnValueOnce({
        isDirectory: () => false // groups data dir does not exist
      });
      fs.readdirSync.mockReturnValueOnce(["file1.json", "file2.json", "something.else"]);
      fs.readJsonSync.mockReturnValueOnce({hello: "world1"});
      fs.readJsonSync.mockReturnValueOnce({hello: "world2"});

      expect(p.getGroupsData('tool')).toEqual({});
    });
  });

  describe('import group data', () => {
    it('imports new group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false);

      p.importCategoryGroupData('tool', 'src/path');
      expect(fs.copySync.mock.calls.length).toBe(1);
    });

    it('skips importing existing group data', () => {
      const p = new ProjectAPI('/root');

      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true); // file already exists

      p.importCategoryGroupData('tool', 'src/path');
      expect(fs.copySync).not.toBeCalled();
    });
  });

  describe('check if category is loaded', () => {
    it('is loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({loaded: ["category"]});
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(true);
      expect(fs.outputJsonSync).not.toBeCalled();
      expect(console.warn).not.toBeCalled();
    });

    it('is not loaded', () => {
      const p = new ProjectAPI('/root');
      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({loaded: []}); // category is not loaded
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
      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()}); // category is not loaded
      expect(p.isCategoryLoaded('tool', 'category')).toEqual(false);
      expect(fs.outputJsonSync.mock.calls.length).toBe(1);
      expect(console.warn).toBeCalled();
    });
  });

  describe('set category loaded', () => {
    it('adds loaded', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: [], loaded: ["other"]});

      p.setCategoryLoaded('tool', 'category');
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["other", "category"]});
    });

    it('removes loaded', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: [], loaded: ["category", "other"]});

      p.setCategoryLoaded('tool', 'category', false);
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["other"]});
    });

    it('rebuilds missing file', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false); // metadata file is missing

      p.setCategoryLoaded('tool', 'category');
      expect(console.warn).not.toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["category"]});
    });

    it('rebuilds corrupt file', () => {
      const p = new ProjectAPI('/root');

      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()});
      p.setCategoryLoaded('tool', 'category');

      expect(console.warn).toBeCalled();
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": [], "loaded": ["category"]});
    });
  });

  describe('get selected categories', () => {
    it('has selected', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockReturnValueOnce({current: ["category"]});

      expect(p.getSelectedCategories('tool')).toEqual(["category"]);
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

      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()});

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
      fs.readJsonSync.mockReturnValueOnce({current: ["other"], loaded: []});

      p.setSelectedCategories('tool', ["category"]);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": ["category"], "loaded": []}
      );
      expect(console.warn).not.toBeCalled();
    });

    it('is missing file', () => {
      const p = new ProjectAPI('/root');

      jest.spyOn(global.console, 'warn');
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(false);

      p.setSelectedCategories('tool', ["category"]);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": ["category"], "loaded": []}
      );
      expect(console.warn).not.toBeCalled();
    });

    it('has corrupt file', () => {
      const p = new ProjectAPI('/root');

      global.console = {warn: jest.fn()};
      fs.readFileSync.mockReturnValueOnce(`{"project":{"id":"book"}}`);
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.readJsonSync.mockImplementation(() => {throw new Error()});

      p.setSelectedCategories('tool', ["category"]);
      expect(fs.outputJsonSync).toBeCalledWith(
        path.join(path.sep, "root", ".apps", "translationCore", "index", "tool", "book", ".categories"),
        {"current": ["category"], "loaded": []}
      );
      expect(console.warn).toBeCalled();
    });
  });

});
