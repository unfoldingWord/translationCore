import fs from 'fs-extra';
import path from 'path-extra';
import * as Version from './VersionUtils';
import * as ProjectOverwriteHelpers from '../ProjectOverwriteHelpers';
import { generateTimestamp } from '..';

export const MIGRATE_MANIFEST_VERSION = 7;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, userName) => {
  Version.getVersionFromManifest(projectPath); // ensure manifest converted for tc
  if (shouldRun(projectPath)) run(projectPath, userName);
};

/**
 * @description function that checks to see if the migration should be run
 * @param {String} projectPath - path to project
 * @return {boolean} true if version number needs to be updated
 */
const shouldRun = (projectPath) => {
  const version = Version.getVersionFromManifest(projectPath);
  return (version < MIGRATE_MANIFEST_VERSION);
};


/**
 * @description - update manifest version to this version
 * @param {String} projectPath - path to project
 * @return {null}
 */
const run = (projectPath, userName) => {
  migrateToVersion7(projectPath, userName);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

/**
 * @description Makes sure that any verse with verseEdits are in sync with the actual text
 * since in 1.0 they could have reimported verses that have had external edits
 *
 * @param {*} projectPath - Project where all related documentation resides
 */
const migrateToVersion7 = (projectPath, userName) => {
  try {
    const manifestPath = path.join(projectPath, 'manifest.json');
    if(fs.existsSync(manifestPath)) {
      const manifest = fs.readJsonSync(manifestPath);
      const bookId = manifest.project.id;
      const verseEditsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'verseEdits', bookId);
      const isChapterDirectory = name => {
        const fullPath = path.join(verseEditsPath, name);
        return fs.lstatSync(fullPath).isDirectory() && name.match(/^\d/i);
      };
      fs.readdirSync(verseEditsPath).filter(isChapterDirectory).forEach(chapter => {
        const chapterPath = path.join(verseEditsPath, chapter);
        const chapterData = fs.readJsonSync(path.join(projectPath, bookId, chapter+'.json'));
        const isVerseDirectory = name => {
          const fullPath = path.join(chapterPath, name);
          return fs.lstatSync(fullPath).isDirectory() && name.match(/^\d/i);
        };
        fs.readdirSync(chapterPath).filter(isVerseDirectory).forEach(verse => {
          const versePath = path.join(chapterPath, verse);
          const verseEdits = fs.readdirSync(versePath).filter(name => path.extname(name) === '.json');
          if (verseEdits.length) {
            const verseEditFileName = verseEdits.sort().pop();
            const verseEditFilePath = path.join(versePath, verseEditFileName);
            const latestVerseEdit = fs.readJSONSync(verseEditFilePath);
            const lastVerse = latestVerseEdit['verseAfter'];
            const currentVerse = chapterData[verse];
            if (lastVerse != currentVerse) {
              let modifiedTimestamp = generateTimestamp(fs.statSync(verseEditFilePath).mtime);
              if (modifiedTimestamp < verseEditFileName.split('.').slice(0, -1).join('.')) {
                modifiedTimestamp = generateTimestamp();
              }
              ProjectOverwriteHelpers.createVerseEdit(projectPath, lastVerse, currentVerse, bookId, chapter, verse, userName, modifiedTimestamp);
            }
          }
        });
      });
    } else {
      console.log("Manifest not found.");
    }
  } catch(e){
    console.log("Migration error: " + e.toString());
  }
};
