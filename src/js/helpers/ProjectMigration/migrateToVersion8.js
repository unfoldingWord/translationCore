import fs from 'fs-extra';
import path from 'path-extra';
import * as Version from './VersionUtils';

export const MIGRATE_MANIFEST_VERSION = 8;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {String} userName
 */
export default (projectPath, userName) => {
  Version.getVersionFromManifest(projectPath); // ensure manifest converted for tc

  if (shouldRun(projectPath)) {
    run(projectPath, userName);
  }
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
 * @param {String} userName
 * @return {null}
 */
const run = (projectPath, userName) => {
  console.log('migrateToVersion8(' + projectPath + ')');
  migrateToVersion8(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

const ELLIPSIS = '\u2026';
const ELLIPSIS_AND_SPACE = ' \u2026 ';

/**
 * replace the ellipsis in object string
 * @param {object} object
 * @param {string} key
 * @param {boolean} changed_
 */
const replaceEllipsisInObjectStr = (object, key, changed_) => {
  let objectStr = object && object[key];
  const changed = objectStr && (typeof objectStr === 'string') && objectStr.includes(ELLIPSIS);

  if (changed) {
    if (objectStr === ELLIPSIS) {
      object[key] = '&';
    } else {
      objectStr = objectStr.replaceAll(ELLIPSIS_AND_SPACE, ' & ');
      object[key] = objectStr.replaceAll(ELLIPSIS, ' & ');
    }
  }
  return changed || changed_;
};

/**
 * replace the ellipsis in object array
 * @param {object} object
 * @param {string} key
 * @param {string} subKey
 * @param {boolean} changed_
 */
const replaceEllipsisInObjectArray = (object, key, subKey, changed_) => {
  const objectArray = object && object[key];
  const isArray = objectArray && (Array.isArray(objectArray));

  if (isArray) {
    for (const item of objectArray) {
      let objectStr = item && item[subKey];
      const changed = objectStr && (typeof objectStr === 'string') && objectStr.includes(ELLIPSIS);

      if (changed) {
        changed_ = true;

        if (objectStr === ELLIPSIS) {
          item[subKey] = '&';
        } else {
          objectStr = objectStr.replaceAll(ELLIPSIS_AND_SPACE, ' & ');
          item[subKey] = objectStr.replaceAll(ELLIPSIS, ' & ');
        }
      }
    }
  } else { // check if string format
    changed_ = replaceEllipsisInObjectStr(object, key, changed_);
  }
  return changed_;
};

/**
 * @description upgrades any checks with ellipsis to use ampersand
 * since in 1.0 they could have reimported verses that have had external edits
 *
 * @param {String} projectPath - Project where all related documentation resides
 */
const migrateToVersion8 = (projectPath) => {
  try {
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      const manifest = fs.readJsonSync(manifestPath);
      const bookId = manifest.project.id;
      // const verseEditsPath = path.join(projectPath, '.apps', 'translationCore', 'checkData', 'verseEdits', bookId);
      const checkDataPath = path.join(projectPath, '.apps', 'translationCore', 'checkData');
      const checksFolders = fs.readdirSync(checkDataPath).filter(item => item !== '.DS_Store');

      for (const check of checksFolders) {
        const checkFolder = path.join(checkDataPath, check, bookId);

        const isNumberDirectory = (name, folder) => {
          const fullPath = path.join(folder, name);
          return fs.lstatSync(fullPath).isDirectory() && name.match(/^\d/i);
        };

        const isChapterDirectory = (name) => isNumberDirectory(name, checkFolder);

        fs.readdirSync(checkFolder).filter(isChapterDirectory).forEach(chapter => {
          const checkChapterPath = path.join(checkFolder, chapter);

          const isVerseDirectory = (name) => isNumberDirectory(name, checkChapterPath);

          fs.readdirSync(checkChapterPath).filter(isVerseDirectory).forEach(verse => {
            const checksVersePath = path.join(checkChapterPath, verse);
            const checks = fs.readdirSync(checksVersePath).filter(name => path.extname(name) === '.json');

            if (checks.length) {
              for (const check of checks) {
                const checkFilePath = path.join(checksVersePath, check);
                const checkData = fs.readJSONSync(checkFilePath);
                let changed = false;

                if (checkData && checkData.contextId) {
                  changed = replaceEllipsisInObjectStr(checkData.contextId, 'quoteString', changed);
                  changed = replaceEllipsisInObjectArray(checkData.contextId, 'quote', 'word', changed);
                  changed = replaceEllipsisInObjectStr(checkData.contextId, 'glQuote', changed);
                }

                changed = replaceEllipsisInObjectStr(checkData, 'gatewayLanguageQuote', changed);

                if (checkData && checkData.selections) {
                  changed = replaceEllipsisInObjectArray(checkData, 'selections', 'text', changed);
                }

                if (changed) {
                  fs.outputJsonSync(checkFilePath, checkData);
                }
              }
            }
          });
        });
      }
    } else {
      console.log('migrateToVersion8() - Manifest not found.');
    }
  } catch (e){
    console.log('migrateToVersion8() - Migration error: ' + e.toString());
  }
};
