/* eslint-env jest */
//helpers
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
