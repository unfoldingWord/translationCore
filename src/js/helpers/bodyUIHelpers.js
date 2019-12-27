/* eslint-disable no-nested-ternary */
export function getIconColorFromIndex(stepIndex, steps = []) {
  let colorsArray = [];
  colorsArray.push(stepIndex === 0 ? 'black' : stepIndex > 0 ? 'var(--accent-color-dark)' : '');
  colorsArray.push(stepIndex === 1 ? 'black' : steps[1] ? 'var(--accent-color-dark)' : 1 > stepIndex ? 'grey' : 'var(--accent-color-dark)');
  colorsArray.push(stepIndex === 2 ? 'black' : steps[2] ? 'var(--accent-color-dark)' : 2 > stepIndex ? 'grey' : 'var(--accent-color-dark)');
  colorsArray.push(stepIndex === 3 ? 'black' : steps[3] ? 'var(--accent-color-dark)' : 3 > stepIndex ? 'grey' : 'var(--accent-color-dark)');
  return colorsArray;
}
