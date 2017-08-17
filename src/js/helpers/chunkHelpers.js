/* eslint-disable no-console */

/**
 * @description Verifies that the manifest given has an accurate count of finished chunks.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function verifyChunks(projectPath, manifest) {
  if (!projectPath || !manifest) return null;
  const chunkChapters = fs.readdirSync(projectPath);
  let finishedChunks = [];
  for (const chapter in chunkChapters) {
    if (!isNaN(chunkChapters[chapter])) {
      const chunkVerses = fs.readdirSync(projectPath + '/' + chunkChapters[chapter]);
      for (let chunk in chunkVerses) {
        const currentChunk = chunkVerses[chunk].replace(/(?:\(.*\))?\.txt/g, '');
        const chunkString = chunkChapters[chapter].trim() + '-' + currentChunk.trim();
        if (!finishedChunks.includes(chunkString)) {
          finishedChunks.push(chunkString);
        }
      }
    }
  }
  manifest.finished_chunks = finishedChunks;
  manifest.tcInitialized = true;
  return manifest;
}
