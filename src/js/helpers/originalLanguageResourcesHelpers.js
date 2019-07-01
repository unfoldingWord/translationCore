
/**
 * Returns the original language version number needed for tn's group data files.
 * @param {array} tsvRelations
 * @param {string} resourceId
 */
export function getTsvOLVersion(tsvRelations, resourceId) {
  // Get the query string from the tsv_relation array for given resourceId
  const query = tsvRelations.find((query) => query.includes(resourceId));
  // Get version number from query
  const tsvOLVersion = query.split('?v=')[1];
  return tsvOLVersion;
}
