/* eslint-env jest */
import isEqual from 'lodash/isEqual';
//helpers
import * as groupsIndexHelpers from '../src/js/helpers/groupsIndexHelpers';

describe('groupsIndexHelpers.sortWordObjectsByString', () => {
  it('should return groupsIndex sorted and in order', function () {
    const groupsIndex = [
      {"id":"chapter_1","name":"Chapter 1"},
      {"id":"chapter_10","name":"Chapter 10"},
      {"id":"chapter_100","name":"Chapter 100"},
      {"id":"chapter_11","name":"Chapter 11"},
      {"id":"chapter_19","name":"Chapter 19"},
      {"id":"chapter_2","name":"Chapter 2"},
      {"id":"chapter_20","name":"Chapter 20"},
      {"id":"chapter_3","name":"Chapter 3"}
    ];
    const output = groupsIndexHelpers.sortGroupsIndex(groupsIndex);
    const expected = [
      {"id":"chapter_1","name":"Chapter 1"},
      {"id":"chapter_2","name":"Chapter 2"},
      {"id":"chapter_3","name":"Chapter 3"},
      {"id":"chapter_10","name":"Chapter 10"},
      {"id":"chapter_11","name":"Chapter 11"},
      {"id":"chapter_19","name":"Chapter 19"},
      {"id":"chapter_20","name":"Chapter 20"},
      {"id":"chapter_100","name":"Chapter 100"}
    ];
    expect(isEqual(expected, output)).toBeTruthy;
  });
  it('should return groupsIndex sorted and in order', function () {
    const groupsIndex = [
      {"id":"s","name":"S"},
      {"id":"g","name":"G"},
      {"id":"a","name":"A"},
      {"id":"f","name":"F"},
      {"id":"k","name":"K"},
      {"id":"h","name":"H"},
      {"id":"d","name":"D"},
      {"id":"j","name":"J"}
    ];
    const output = groupsIndexHelpers.sortGroupsIndex(groupsIndex);
    const expected = [
      {"id":"a","name":"A"},
      {"id":"d","name":"D"},
      {"id":"f","name":"F"},
      {"id":"g","name":"G"},
      {"id":"h","name":"H"},
      {"id":"j","name":"J"},
      {"id":"k","name":"K"},
      {"id":"s","name":"S"}
    ];
    expect(isEqual(expected, output)).toBeTruthy;
  });
});
