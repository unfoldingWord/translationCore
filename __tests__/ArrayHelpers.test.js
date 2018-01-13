/* eslint-env jest */
//helpers
import * as ArrayHelpers from '../src/js/helpers/ArrayHelpers';

describe("groupConsecutiveNumbers", () => {
  it('handles all consecutive numbers', () => {
    const numbers = [1,2,3,4];
    const result = ArrayHelpers.groupConsecutiveNumbers(numbers);
    const expected = [[1,2,3,4]];
    expect(result).toEqual(expected);
  });
  it('handles all non-consecutive numbers', () => {
    const numbers = [1,3,5,7];
    const result = ArrayHelpers.groupConsecutiveNumbers(numbers);
    const expected = [[1],[3],[5],[7]];
    expect(result).toEqual(expected);
  });
  it('handles mixed consecutive and non-consecutive numbers', () => {
    const numbers = [1,2,4,3,5,6];
    const result = ArrayHelpers.groupConsecutiveNumbers(numbers);
    const expected = [[1,2],[4],[3],[5,6]];
    expect(result).toEqual(expected);
  });
  it('handles out of order numbers', () => {
    const numbers = [4,3,2,1];
    const result = ArrayHelpers.groupConsecutiveNumbers(numbers);
    const expected = [[4],[3],[2],[1]];
    expect(result).toEqual(expected);
  });
});

describe("deleteIndices", () => {
  it('handles deleting first', () => {
    const numbers = [1,2,3,4];
    const index = [0];
    const result = ArrayHelpers.deleteIndices(numbers, index);
    const expected = [2,3,4];
    expect(result).toEqual(expected);
  });
  it('handles deleting last', () => {
    const numbers = [1,2,3,4];
    const index = [numbers.length-1];
    const result = ArrayHelpers.deleteIndices(numbers, index);
    const expected = [1,2,3];
    expect(result).toEqual(expected);
  });
  it('handles deleting middle', () => {
    const numbers = [1,2,3,4];
    const index = [1];
    const result = ArrayHelpers.deleteIndices(numbers, index);
    const expected = [1,3,4];
    expect(result).toEqual(expected);
  });
  it('handles deleting multiples', () => {
    const numbers = [1,2,3,4];
    const index = [0,2,3];
    const result = ArrayHelpers.deleteIndices(numbers, index);
    const expected = [2];
    expect(result).toEqual(expected);
  });
  it('handles deleting all', () => {
    const numbers = [1,2,3,4];
    const index = [0,1,2,3];
    const result = ArrayHelpers.deleteIndices(numbers, index);
    const expected = [];
    expect(result).toEqual(expected);
  });
});
