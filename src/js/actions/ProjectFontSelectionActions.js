import { addObjectPropertyToManifest } from './ProjectDetailsActions';

/**
 * Saves a font name in the manifest of the current project.
 * @param {string} fontName - font name.
 */
export function setProjectFont(fontName) {
  return ((dispatch) => {
    dispatch(addObjectPropertyToManifest('font', fontName));
  });
}
