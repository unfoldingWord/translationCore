export function getIconColorFromIndex(stepIndex) {
  let colorsArray = [];
  colorsArray.push(stepIndex === 0 ? "black" : stepIndex > 0 ? "var(--accent-color-dark)" : "");
  colorsArray.push(stepIndex === 1 ? "black" : 1 > stepIndex ? "grey" : stepIndex > 1 ? "var(--accent-color-dark)" : "");
  colorsArray.push(stepIndex === 2 ? "black" : 2 > stepIndex ? "grey" : stepIndex > 2 ? "var(--accent-color-dark)" : "");
  colorsArray.push(stepIndex === 3 ? "black" : 3 > stepIndex ? "grey" : stepIndex > 3 ? "var(--accent-color-dark)" : "");
  return colorsArray;
}