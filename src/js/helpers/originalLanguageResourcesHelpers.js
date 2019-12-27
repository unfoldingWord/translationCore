
/**
 * Returns the original language version number needed for tn's group data files.
 * @param {array} tsvRelations
 * @param {string} resourceId
 */
export function getTsvOLVersion(tsvRelations, resourceId) {
  try {
    let tsvOLVersion = null;

    if (tsvRelations) {
      // Get the query string from the tsv_relation array for given resourceId
      const query = tsvRelations.find((query) => query.includes(resourceId));

      if (query) {
        // Get version number from query
        tsvOLVersion = query.split('?v=')[1];
      }
    }
    return tsvOLVersion;
  } catch (error) {
    console.error(error);
  }
}
