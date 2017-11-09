export function getIconColorFromIndex(stepIndex) {
  let homeColor = stepIndex === 0 ? "black" : stepIndex > 0 ? "var(--accent-color-dark)" : "";
  let userColor = stepIndex === 1 ? "black" : 1 > stepIndex ? "grey" : stepIndex > 1 ? "var(--accent-color-dark)" : "";
  let projectColor = stepIndex === 2 ? "black" : 2 > stepIndex ? "grey" : stepIndex > 2 ? "var(--accent-color-dark)" : "";
  let toolColor = stepIndex === 3 ? "black" : 3 > stepIndex ? "grey" : stepIndex > 3 ? "var(--accent-color-dark)" : "";
  return {
    homeColor,
    userColor,
    projectColor,
    toolColor
  };
}