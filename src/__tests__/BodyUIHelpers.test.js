/* eslint-env jest */
import * as bodyUIHelpers from '../js/helpers/bodyUIHelpers';

describe('bodyUIHelpers', () => {
  let index;
  let inputs = [0, 1, 2, 3];

  beforeEach(() => {
    index = inputs.shift();
  });

  test('should return the correct colors given an index of the stepper', () => {
    let [ homeColor, userColor, projectColor, toolColor ] = bodyUIHelpers.getIconColorFromIndex(index);
    expect(homeColor).toBe('black');
    expect(userColor).toBe('grey');
    expect(projectColor).toBe('grey');
    expect(toolColor).toBe('grey');
  });

  test('should return the correct colors given an index of the stepper', () => {
    let [ homeColor, userColor, projectColor, toolColor ] = bodyUIHelpers.getIconColorFromIndex(index);
    expect(homeColor).toBe('var(--accent-color-dark)');
    expect(userColor).toBe('black');
    expect(projectColor).toBe('grey');
    expect(toolColor).toBe('grey');
  });

  test('should return the correct colors given an index of the stepper', () => {
    let [ homeColor, userColor, projectColor, toolColor ] = bodyUIHelpers.getIconColorFromIndex(index);
    expect(homeColor).toBe('var(--accent-color-dark)');
    expect(userColor).toBe('var(--accent-color-dark)');
    expect(projectColor).toBe('black');
    expect(toolColor).toBe('grey');
  });

  test('should return the correct colors given an index of the stepper', () => {
    let [ homeColor, userColor, projectColor, toolColor ] = bodyUIHelpers.getIconColorFromIndex(index);
    expect(homeColor).toBe('var(--accent-color-dark)');
    expect(userColor).toBe('var(--accent-color-dark)');
    expect(projectColor).toBe('var(--accent-color-dark)');
    expect(toolColor).toBe('black');
  });
});
