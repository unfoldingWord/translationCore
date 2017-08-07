/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
import yaml from 'yamljs';

/**
 * 
 * @param {array} bibles 
 * @param {String} extractedFilePath 
 * @param {String} RESOURCE_OUTPUT_PATH 
 */
export function generateBibles(
  bibles,
  extractedFilePath,
  RESOURCE_OUTPUT_PATH,
) {
  console.log(
    '\x1b[33m%s\x1b[0m',
    'Generating tC compatible resource data structure ...',
  );
  bibles.forEach(bible => {
    const pathToUsfmFile = path.join(extractedFilePath, bible);
    let oldManifest = getResourceManifestFromYaml(extractedFilePath);
    let bibleVersion = 'v' + oldManifest.dublin_core.version;
    generateBibleManifest(oldManifest, bibleVersion, RESOURCE_OUTPUT_PATH);

    let usfmBibleBook = fs.readFileSync(pathToUsfmFile).toString('utf8');
    let jsonBibleBook = usfm.toJSON(usfmBibleBook);

    // get parsed book
    const chapters = Object.keys(jsonBibleBook);
    chapters.forEach(chapterNumber => {
      let arrayValue = parseInt(chapterNumber, 10);
      // only allow chapter numbers to generate bible (no strings)
      if (typeof arrayValue === 'number' && !isNaN(arrayValue)) {
        let fileName = chapterNumber + '.json';
        let bibleId = jsonBibleBook.headers['toc3']
          .toLowerCase()
          .replace(' ', '');
        console.log(bibleId);
        let savePath = path.join(
          RESOURCE_OUTPUT_PATH,
          bibleVersion,
          bibleId,
          fileName,
        );
        fs.outputJsonSync(savePath, jsonBibleBook[chapterNumber]);
      }
    });
  });
}

/**
 * 
 * @param {String} extractedFilePath 
 */
export function getResourceManifestFromYaml(extractedFilePath) {
  let filePath = path.join(extractedFilePath, 'manifest.yaml');
  let yamlManifest = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(yamlManifest);
}

/**
 * 
 * @param {object} oldManifest 
 * @param {String} bibleVersion 
 * @param {String} RESOURCE_OUTPUT_PATH 
 */
function generateBibleManifest(
  oldManifest,
  bibleVersion,
  RESOURCE_OUTPUT_PATH,
) {
  let newManifest = {};
  newManifest.language_id = oldManifest.dublin_core.language.identifier;
  newManifest.language_name = oldManifest.dublin_core.language.title;
  newManifest.direction = oldManifest.dublin_core.language.direction;
  newManifest.subject = oldManifest.dublin_core.subject;
  newManifest.resource_id = oldManifest.dublin_core.identifier;
  newManifest.resource_title = oldManifest.dublin_core.title;
  newManifest.description =
    oldManifest.dublin_core.identifier.toLowerCase() === 'ulb' || 'udb'
      ? 'Gateway Language'
      : 'Original Language';

  let savePath = path.join(RESOURCE_OUTPUT_PATH, bibleVersion, 'manifest.json');

  fs.outputJsonSync(savePath, newManifest);
}
