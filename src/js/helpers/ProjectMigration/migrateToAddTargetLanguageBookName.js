import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
// helpers
import * as usfmHelpers from '../usfmHelpers';

/**
 * @description Look at several places inside project path for translated book name
 * then place it into the manifest if it is not already there.
 *
 * @param {*} projectPath - Project where all related documentation resides
 */
const migrateToAddTargetLanguageBookName = (projectPath) => new Promise ((resolve, reject) => {
  try {
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      const manifest = fs.readJsonSync(manifestPath);
      let targetBookName = '';

      if (!manifest.target_language.book ||
            typeof manifest.target_language.book.name !== 'string' ||
            manifest.target_language.book.name.length === 0) {
        console.log('migrateToAddTargetLanguageBookName(' + projectPath + ')');

        const titlePath = path.join(projectPath, 'front', 'title.txt');
        const titleAlternatePath = path.join(projectPath, '00', 'title.txt');
        const titleThirdPath = path.join(projectPath, '.apps', 'translationCore', 'importedSource', 'front', 'title.txt');
        const titleFourthPath = path.join(projectPath, '.apps', 'translationCore', 'importedSource', '00', 'title.txt');

        if (fs.existsSync(titlePath)) {
          targetBookName = fs.readFileSync(titlePath).toString();
        } else if (fs.existsSync(titleAlternatePath)) {
          targetBookName = fs.readFileSync(titleAlternatePath).toString();
        } else if (fs.existsSync(titleThirdPath)) {
          targetBookName = fs.readFileSync(titleThirdPath).toString();
        } else if (fs.existsSync(titleFourthPath)) {
          targetBookName = fs.readFileSync(titleFourthPath).toString();
        } else { // project's source is usfm file.
          targetBookName = getTargetLanguageNameFromUsfm(projectPath, manifest);
        }

        manifest.target_language['book'] = { name: targetBookName };
      }
      fs.outputJsonSync(manifestPath, manifest, { spaces: 2 });
      resolve(manifest); // This is for unit test.
    } else {
      throw new Error('Manifest not found.');
    }
  } catch (e){
    reject(e);
  }
});

/**
 * @description look for a header inside the USFM text for the translated book name
 *
 * @param {*} projectPath - root of places to look
 * @param {*} manifest - place to put translated book name when found
 */
const getTargetLanguageNameFromUsfm = (projectPath, manifest) => {
  let targetBookName = '';
  const bookId = manifest.project ? manifest.project.id : null;

  if (bookId) {
    const filename = bookId + '.usfm';
    const usfmFilePath = path.join(projectPath, '.apps', 'translationCore', 'importedSource', filename);

    if (fs.existsSync(usfmFilePath)) {
      const usfmFile = usfmHelpers.loadUSFMFile(usfmFilePath);
      const parsedUsfm = usfm.toJSON(usfmFile);

      targetBookName = usfmHelpers.getHeaderTag(parsedUsfm.headers, 'h');
    }
  } else {
    console.log('The project is missing the book Id');
  }
  return targetBookName;
};

export default migrateToAddTargetLanguageBookName;
