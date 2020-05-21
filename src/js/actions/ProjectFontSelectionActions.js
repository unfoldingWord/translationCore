import { addObjectPropertyToManifest } from './ProjectDetailsActions';

/**
 * Saves a font name in the manifest of the current project.
 * @param {string} languageFont - language font name.
 */
export function setProjectFont(languageFont) {
  return ((dispatch) => {
    dispatch(addObjectPropertyToManifest('languageFont', languageFont));
  });
}
