/* eslint-env jest */
jest.unmock('fs-extra');
//helpers
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';
import path from 'path';

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
      [path.join('en', 'bibles', 'udb')]: 'v10',
      [path.join('en', 'bibles', 'ulb')]: 'v11',
      [path.join('grc', 'bibles', 'ugnt')]: 'v0'
    };
    for(let property in resourcePathsExpectedVersions) {
      if (resourcePathsExpectedVersions.hasOwnProperty(property)) {
        let resourcePath = '__tests__/fixtures/resources/'+property;
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
});
