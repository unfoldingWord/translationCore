/* eslint-env jest */
import path from 'path';
jest.unmock('fs-extra');
// helpers
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';

describe('ResourcesHelpers.chapterGroupsIndex', () => {
  it('should return groupsIndex array for chapters 1-150', function () {
    const output = ResourcesHelpers.chapterGroupsIndex();
    expect(output.constructor).toBe(Array);
    expect(output.length).toEqual(150);
    expect(output[0].id).toBe('chapter_1');
    expect(output[0].name).toBe('Chapter 1');
    expect(output[149].id).toBe('chapter_150');
    expect(output[149].name).toBe('Chapter 150');
  });
});

describe('ResourcesHelpers.chapterGroupsData', () => {
  it('should return groupsData array for Titus', function () {
    const output = ResourcesHelpers.chapterGroupsData('tit', 'toolTemplate');
    expect(output.constructor).toBe(Array);
    expect(output.length).toEqual(3);
    expect(output[0].constructor).toBe(Array);
    expect(output[0].length).toEqual(16);
    expect(output[0][0].contextId.reference.bookId).toBe('tit');
    expect(output[0][0].contextId.reference.chapter).toBe(1);
    expect(output[0][0].contextId.reference.verse).toBe(1);
    expect(output[0][0].contextId.tool).toBe('toolTemplate');
    expect(output[0][0].contextId.groupId).toBe('chapter_1');
    expect(output[2].constructor).toBe(Array);
    expect(output[2].length).toEqual(15);
    expect(output[2][14].contextId.reference.bookId).toBe('tit');
    expect(output[2][14].contextId.reference.chapter).toBe(3);
    expect(output[2][14].contextId.reference.verse).toBe(15);
    expect(output[2][14].contextId.tool).toBe('toolTemplate');
    expect(output[2][14].contextId.groupId).toBe('chapter_3');
  });
});

describe('ResourcesHelpers getLatestVersionInPath() tests', ()=>{
  it('Test multiple fixture resource directories that latest version is returned', () => {
    const resourcePathsExpectedVersions = {
      [path.join('en', 'bibles', 'ust')]: 'v10',
      [path.join('en', 'bibles', 'ult')]: 'v12.1',
      [path.join('grc', 'bibles', 'ugnt')]: 'v0'
    };
    for(let property in resourcePathsExpectedVersions) {
      if (resourcePathsExpectedVersions.hasOwnProperty(property)) {
        let resourcePath = path.join(__dirname, 'fixtures/resources', property);
        console.log(resourcePath);
        let versionPath = ResourcesHelpers.getLatestVersionInPath(resourcePath);
        expect(versionPath).toEqual(path.join(resourcePath, resourcePathsExpectedVersions[property]));
      }
    }
  });
  it('Test getLatestVersionInPath with a directory multiple subdirectories and files', () => {
    const testPath = path.join('__tests__', 'fixtures', 'latestVersionTest');
    const versionPath = ResourcesHelpers.getLatestVersionInPath(testPath);
    const expectedResult = path.join(testPath, 'v100.2a');
    expect(versionPath).toEqual(expectedResult);
  });

  it('Test various paths', ()=>{
    expect(ResourcesHelpers.getLatestVersionInPath(null)).toEqual(null); // invalid dir
    expect(ResourcesHelpers.getLatestVersionInPath(path.join('path', 'does', 'not', 'exist'))).toEqual(null); // invalid directory
    expect(ResourcesHelpers.getLatestVersionInPath(path.join('__tests__', 'fixtures', 'latestVersionTest', 'v0'))).toEqual(null); // directory with no versions
  });
});

describe('ResourcesHelpers getVersionsInPath() tests', ()=>{
  it('Test multiple fixture resource directories return a proper array of versions', () => {
    const resourcePathsExpectedVersions = {
      [path.join('en', 'bibles', 'ust')]: ['v10'],
      [path.join('en', 'bibles', 'ult')]: ['v11', 'v12.1'],
      [path.join('grc', 'bibles', 'ugnt')]: ['v0']
    };
    for(let property in resourcePathsExpectedVersions) {
      if (resourcePathsExpectedVersions.hasOwnProperty(property)) {
        let resourcePath = path.join(__dirname, 'fixtures/resources/'+property);
        let versions = ResourcesHelpers.getVersionsInPath(resourcePath);
        expect(versions).toEqual(resourcePathsExpectedVersions[property]);
      }
    }
  });

  it('Test getLatestVersionsInPath with a directory multiple subdirectories and files', () => {
    const testPath = path.join('__tests__', 'fixtures', 'latestVersionTest');
    const versions = ResourcesHelpers.getVersionsInPath(testPath);
    const expectedResult = ['v0', 'v0.0', 'v1.1','v10','v100','v100.1','v100.2a','v80'];
    expect(versions).toEqual(expectedResult);
  });

  it('Test various paths', ()=>{
    expect(ResourcesHelpers.getVersionsInPath(null)).toEqual(null); // invalid dir
    expect(ResourcesHelpers.getVersionsInPath(path.join('path', 'does', 'not', 'exist'))).toEqual(null); // invalid directory
    expect(ResourcesHelpers.getVersionsInPath(path.join('__tests__', 'fixtures', 'latestVersionTest', 'v0'))).toEqual([]); // directory with no versions
  });
});

describe('ResourcesHelpers sortVersions() tests', () => {
  it('Test sortVerions() properly returns a sorted array', () => {
    const unsorted = ['v01.0', 'v1', 'v0', 'v0.0', 'v05.5.2', 'v5.5.1', 'V6.21.0', 'v4.22.0', 'v6.1.0', 'v6.1a.0', 'v5.1.0', 'V4.5.0'];
    const sorted = ResourcesHelpers.sortVersions(unsorted);
    const expectedResult = ['v0', 'v0.0', 'v1', 'v01.0', 'V4.5.0', 'v4.22.0', 'v5.1.0', 'v5.5.1', 'v05.5.2', 'v6.1.0', 'v6.1a.0', 'V6.21.0'];
    expect(sorted).toEqual(expectedResult);
  });

  it('Test various arguments to the sortVersion function', () => {
    expect(ResourcesHelpers.sortVersions(null)).toEqual(null); // nothing to sort
    expect(ResourcesHelpers.sortVersions([])).toEqual([]); // nothing to sort
    expect(ResourcesHelpers.sortVersions([2, 1])).toEqual([2, 1]); // won't sort
    expect(ResourcesHelpers.sortVersions([2, 1])).toEqual([2, 1]); // won't sort
    expect(ResourcesHelpers.sortVersions("hello world")).toEqual("hello world"); // won't sort
    expect(ResourcesHelpers.sortVersions(111)).toEqual(111); // won't sort
  });
});

describe('ResourcesHelpers getGLQuote() tests', () => {
  const currentToolName = 'translationWords';
  const hindiExpectedData = [{
    "id": "good",
    "name": "अच्छा, भलाई"
  },
  {
    "id": "iniquity",
    "name": "अधर्म, अधर्मों"
  },
  {
    "id": "unrighteous",
    "name": "अधर्मी, अधर्म"
  },
  {
    "id": "unjust",
    "name": "अधर्मी, अन्याय से, अन्याय"
  }];
  const englishExpectedData = [
    {
      "id": "abomination",
      "name": "abomination, abominations, abominable"
    },
    {
      "id": "adoption",
      "name": "adoption, adopt, adopted"
    },
    {
      "id": "adultery",
      "name": "adultery, adulterous, adulterer, adulteress, adulterers, adulteresses"
    },
    {
      "id": "almighty",
      "name": "Almighty"
    }];
  it('Test getGLQuote() properly returns the en gateway language quote for the groupId', () => {
    const currentGLLanguageID = 'en';
    for (var groupIndexObject of englishExpectedData) {
      expect(ResourcesHelpers.getGLQuote(currentGLLanguageID, groupIndexObject.id, currentToolName)).toBe(groupIndexObject.name);
    }
  });
  it('Test getGLQuote() properly returns the hi gateway language quote for the groupId', () => {
    const currentGLLanguageID = 'hi';
    for (var groupIndexObject of hindiExpectedData) {
      expect(ResourcesHelpers.getGLQuote(currentGLLanguageID, groupIndexObject.id, currentToolName)).toBe(groupIndexObject.name);
    }
  });

  it('Test getGLQuote() doesnt returns the gateway language quote for a non-existent language', () => {
    const currentGLLanguageID = 'languagewedonthaveyet';
    for (var groupIndexObject of hindiExpectedData) {
      expect(ResourcesHelpers.getGLQuote(currentGLLanguageID, groupIndexObject.id, currentToolName)).toBe(null);
    }
  });
});
