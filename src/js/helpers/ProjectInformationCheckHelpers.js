
export function checkBookReference(manifest) {
  return manifest.project.id && manifest.project.name ? false : true;
}

export function checkLanguageDetails(manifest) {
  return (manifest.target_language.direction && 
    manifest.target_language.id && 
    manifest.target_language.name ? false : true);
}

export function checkTranslators(manifest) {
  return manifest.translators.length === 0;
}

export function checkCheckers(manifest) {
  return manifest.checkers.length === 0;
}