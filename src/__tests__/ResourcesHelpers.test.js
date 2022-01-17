/* eslint-env jest */

import path from 'path';
// helpers
import fs from 'fs-extra';
import * as ResourcesHelpers from '../js/helpers/ResourcesHelpers';
import {
  generateChapterGroupData,
  generateChapterGroupIndex,
} from '../js/helpers/groupDataHelpers';
import ResourceAPI from '../js/helpers/ResourceAPI';
import {
  USER_RESOURCES_PATH,
  STATIC_RESOURCES_PATH,
  TRANSLATION_WORDS,
} from '../js/common/constants';

let mockOtherTnsOlversions = [];

jest.mock('tc-source-content-updater', () => ({
  ...require.requireActual('tc-source-content-updater'),
  getOtherTnsOLVersions: () => mockOtherTnsOlversions,
}));

const resourcesDir = path.join(__dirname, 'fixtures', 'resources');
const latestVersionTestDir = path.join('src', '__tests__', 'fixtures', 'latestVersionTest');

describe('ResourcesHelpers.', () => {
  beforeAll(() => {
    fs.__resetMockFS();
    fs.__loadDirIntoMockFs(resourcesDir, USER_RESOURCES_PATH);
    fs.__loadDirIntoMockFs(STATIC_RESOURCES_PATH, STATIC_RESOURCES_PATH);
    fs.__loadDirIntoMockFs(resourcesDir, resourcesDir);
    fs.__loadDirIntoMockFs(latestVersionTestDir, latestVersionTestDir);
  });

  describe('chapterGroupsIndex', () => {
    it('should return groupsIndex array for chapters 1-150', function () {
      const output = generateChapterGroupIndex();
      expect(output.constructor).toBe(Array);
      expect(output.length).toEqual(150);
      expect(output[0].id).toBe('chapter_1');
      expect(output[0].name).toBe('Chapter 1');
      expect(output[149].id).toBe('chapter_150');
      expect(output[149].name).toBe('Chapter 150');
    });
  });

  describe('chapterGroupsData', () => {
    it('should return groupsData array for Titus', function () {
      const output = generateChapterGroupData('tit', 'toolTemplate');
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

  describe('getLatestVersionInPath() tests', () => {
    it('Test multiple fixture resource directories that latest version is returned', () => {
      const resourcesDir = path.join(__dirname, 'fixtures/resources');
      const resourcePathsExpectedVersions = {
        [path.join('en', 'bibles', 'ust')]: 'v10_Door43-Catalog',
        [path.join('en', 'bibles', 'ult')]: 'v12.1_Door43-Catalog',
        [path.join('el-x-koine', 'bibles', 'ugnt')]: 'v0.2_Door43-Catalog',
      };

      for (let property in resourcePathsExpectedVersions) {
        if (resourcePathsExpectedVersions.hasOwnProperty(property)) {
          let resourcePath = path.join(resourcesDir, property);
          let versionPath = ResourceAPI.getLatestVersion(resourcePath);
          expect(versionPath).toEqual(path.join(resourcePath, resourcePathsExpectedVersions[property]));
        }
      }
    });
    it('Test getLatestVersionInPath with a directory multiple subdirectories and files', () => {
      const versionPath = ResourceAPI.getLatestVersion(latestVersionTestDir);
      const expectedResult = path.join(latestVersionTestDir, 'v100.2a_Door43-Catalog');
      expect(versionPath).toEqual(expectedResult);
    });

    it('Test various paths', () => {
      expect(ResourceAPI.getLatestVersion(null)).toEqual(null); // invalid dir
      expect(ResourceAPI.getLatestVersion(path.join('path', 'does', 'not', 'exist'))).toEqual(null); // invalid directory
      expect(ResourceAPI.getLatestVersion(path.join('src', '__tests__', 'fixtures', 'latestVersionTest', 'v0'))).toEqual(null); // directory with no versions
    });
  });

  describe('getVersionsInPath() tests', () => {
    it('Test multiple fixture resource directories return a proper array of versions', () => {
      const resourcePathsExpectedVersions = {
        [path.join('en', 'bibles', 'ust')]: ['v10_Door43-Catalog'],
        [path.join('en', 'bibles', 'ult')]: ['v11_Door43-Catalog', 'v12.1_Door43-Catalog'],
        [path.join('el-x-koine', 'bibles', 'ugnt')]: ['v0.2_Door43-Catalog'],
      };

      for (let property in resourcePathsExpectedVersions) {
        if (resourcePathsExpectedVersions.hasOwnProperty(property)) {
          let resourcePath = path.join(__dirname, 'fixtures/resources/' + property);
          let versions = ResourcesHelpers.getVersionsInPath(resourcePath);
          expect(versions).toEqual(resourcePathsExpectedVersions[property]);
        }
      }
    });

    it('Test getLatestVersionsInPath with a directory multiple subdirectories and files', () => {
      const testPath = path.join('src', '__tests__', 'fixtures', 'latestVersionTest');
      const versions = ResourcesHelpers.getVersionsInPath(testPath);
      const expectedResult = ['v0_Door43-Catalog', 'v0.1_Door43-Catalog', 'v1.1_Door43-Catalog', 'v10_Door43-Catalog', 'v80_Door43-Catalog', 'v100_Door43-Catalog', 'v100.1_Door43-Catalog', 'v100.2a_Door43-Catalog'];
      expect(versions).toEqual(expectedResult);
    });

    it('Test various paths', () => {
      expect(ResourcesHelpers.getVersionsInPath(null)).toEqual(null); // invalid dir
      expect(ResourcesHelpers.getVersionsInPath(path.join('path', 'does', 'not', 'exist'))).toEqual(null); // invalid directory
      expect(ResourcesHelpers.getVersionsInPath(path.join('src', '__tests__', 'fixtures', 'latestVersionTest', 'v0_Door43-Catalog'))).toEqual([]); // directory with no versions
    });
  });

  describe('sortVersions() tests', () => {
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
      expect(ResourcesHelpers.sortVersions('hello world')).toEqual('hello world'); // won't sort
      expect(ResourcesHelpers.sortVersions(111)).toEqual(111); // won't sort
    });
  });

  describe('getGLQuote() tests', () => {
    const toolName = TRANSLATION_WORDS;
    const hindiExpectedData = [
      {
        'id': 'good',
        'name': 'अच्छा, भलाई',
      },
      {
        'id': 'iniquity',
        'name': 'अधर्म, अधर्मों',
      },
      {
        'id': 'unrighteous',
        'name': 'अधर्मी, अधर्म',
      },
      {
        'id': 'unjust',
        'name': 'अधर्मी, अन्याय से, अन्याय',
      },
    ];
    const englishExpectedData = [
      {
        'id': 'abomination',
        'name': 'abomination, abominable',
      },
      {
        'id': 'adoption',
        'name': 'adoption, adopt, adopted',
      },
      {
        'id': 'adultery',
        'name': 'adultery, adulterous, adulterer, adulteress',
      },
      {
        'id': 'almighty',
        'name': 'Almighty',
      },
    ];

    it('Test getGLQuote() properly returns the en gateway language quote for the groupId', () => {
      const currentGLLanguageID = 'en';

      for (var groupIndexObject of englishExpectedData) {
        expect(ResourcesHelpers.getGLQuote(currentGLLanguageID, groupIndexObject.id, toolName)).toBe(groupIndexObject.name);
      }
    });
    it('Test getGLQuote() properly returns the hi gateway language quote for the groupId', () => {
      const currentGLLanguageID = 'hi';

      for (var groupIndexObject of hindiExpectedData) {
        expect(ResourcesHelpers.getGLQuote(currentGLLanguageID, groupIndexObject.id, toolName)).toBe(groupIndexObject.name);
      }
    });

    it('Test getGLQuote() doesnt returns the gateway language quote for a non-existent language', () => {
      const currentGLLanguageID = 'languagewedonthaveyet';

      for (var groupIndexObject of hindiExpectedData) {
        expect(ResourcesHelpers.getGLQuote(currentGLLanguageID, groupIndexObject.id, toolName)).toBe(null);
      }
    });
  });
});

describe('ResourcesHelpers.preserveNeededOrigLangVersions()', () =>{
  beforeEach(() => {
    fs.__resetMockFS();
    // simulate static resources path
    fs.__loadFilesIntoMockFs(['resources'], path.join('src', '__tests__', 'fixtures'), path.join(STATIC_RESOURCES_PATH, '..'));
    fs.moveSync(path.join(STATIC_RESOURCES_PATH, '../resources'), STATIC_RESOURCES_PATH);
    fs.removeSync(path.join(STATIC_RESOURCES_PATH, 'en/bibles/ult/v11')); // remove old version
  });

  it('test with older version of ugnt in grc/bible that is needed by tN - should not be removed', () => {
    // given
    const deleteOldResourceExpected = false;
    const bibleId = 'ugnt';
    const neededUgntVersion = 'v0.1_Door43-Catalog';
    const unneededUgntVersion = 'v0.0.1_Door43-Catalog';
    fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId), path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId));
    fs.copySync(path.join(STATIC_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, 'v0.2_Door43-Catalog'), path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles', bibleId, neededUgntVersion));
    fs.copySync(path.join(STATIC_RESOURCES_PATH, 'en'), path.join(USER_RESOURCES_PATH, 'en'));
    const ugntPath = path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles/ugnt');
    mockOtherTnsOlversions = [neededUgntVersion];

    // when
    const deleteOldResource = ResourcesHelpers.preserveNeededOrigLangVersions('el-x-koine', 'ugnt', ugntPath);

    // then
    expect(deleteOldResource).toEqual(deleteOldResourceExpected);
    expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles/ugnt', neededUgntVersion, 'manifest.json'))).toBeTruthy(); // should not remove folder
    expect(fs.existsSync(path.join(USER_RESOURCES_PATH, 'el-x-koine/bibles/ugnt', unneededUgntVersion, 'manifest.json'))).toBeFalsy(); // should remove folder
  });
});
