import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
// helpers
import * as usfmHelpers from '../usfmHelpers';

const migrateToAddTargetLanguageBookName = (projectPath) => {
  return new Promise ((resolve, reject) => {
    try {
      const manifestPath = path.join(projectPath, 'manifest.json');
      console.log(fs.existsSync(manifestPath));
      if(fs.existsSync(manifestPath)) {
        const manifest = fs.readJsonSync(manifestPath);
        let targetBookName = '';
        if (!manifest.target_language.book || typeof manifest.target_language.book.name !== 'string' || manifest.target_language.book.name.length === 0) {
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
          resolve(manifest); // This is for unit test.
          fs.outputJsonSync(manifestPath, manifest);
        }    
      } else {
        throw new Error("Manifest not found.");
      }
    } catch(e){
      reject(e);
    }
  });
 
};

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
