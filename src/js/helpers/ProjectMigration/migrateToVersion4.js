import path from 'path';
import fs from 'fs-extra';
import { TRANSLATION_WORDS } from '../../common/constants';
import * as Version from './VersionUtils';

export const MIGRATE_MANIFEST_VERSION = 4;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, projectLink) => {
  Version.getVersionFromManifest(projectPath, projectLink); // ensure manifest converted for tc

  if (shouldRun(projectPath)) {
    run(projectPath);
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
 * @return {null}
 */
const run = (projectPath) => {
  console.log('migrateToVersion4(' + projectPath + ')');
  updateAlignments(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

/**
 * reads the alignment files and updates them to tc manifest version 4.  Includes fixing typos in old alignment:
 *        convert "ἐνκρατῆ" to "ἐγκρατῆ"
 * @param projectPath
 */
export const updateAlignments = function (projectPath) {
  const projectAlignmentDataPath = path.join(projectPath, '.apps', 'translationCore', 'alignmentData');

  if (fs.existsSync(projectAlignmentDataPath)) {
    const alignmentFolders = fs.readdirSync(projectAlignmentDataPath).filter(folder => (fs.statSync(path.join(projectAlignmentDataPath, folder)).isDirectory() && (folder !== '.DS_Store')));

    for (let folder of alignmentFolders) {
      const alignmentPath = path.join(projectAlignmentDataPath, folder);
      const files = fs.readdirSync(alignmentPath).filter((file) => (path.extname(file) === '.json'));

      for (let file of files) {
        const file_path = path.join(alignmentPath, file);
        fixProjectAlignmentTopWords(file_path, file);
      }
    }
  }

  const projectTWordsDataPath = path.join(projectPath, '.apps', 'translationCore', 'index', TRANSLATION_WORDS);

  if (fs.existsSync(projectTWordsDataPath)) {
    const tWordsFolders = fs.readdirSync(projectTWordsDataPath).filter(folder => (fs.statSync(path.join(projectTWordsDataPath, folder)).isDirectory() && (folder !== '.DS_Store')));

    for (let folder of tWordsFolders) {
      const alignmentPath = path.join(projectTWordsDataPath, folder);
      const files = fs.readdirSync(alignmentPath).filter((file) => (path.extname(file) === '.json'));

      for (let file of files) {
        const file_path = path.join(alignmentPath, file);
        fix_tWords(file_path, file);
      }
    }
  }
};

/**
 * updates file to tc manifest version 4.  Fixes spelling in translationWords from "ἐνκρατῆ" to "ἐγκρατῆ".
 * @param filePath
 */
export const fix_tWords = function (filePath) {
  const match = 'ἐνκρατῆ';
  const replace = 'ἐγκρατῆ';
  let modified = false;

  try {
    const items = fs.readJsonSync(filePath);

    for (let item of items) {
      if (item.contextId && item.contextId.quote === match) {
        item.contextId.quote = replace;
        modified = true;
      }
    }

    if (modified) {
      fs.outputJsonSync(filePath, items, { spaces: 2 });
    }
  } catch (e) {
    console.warn('Error opening chapter alignment \'' + filePath + '\': ' + e.toString());
  }
};

/**
 * updates file to tc manifest version 4.  Fixes spelling of alignment top words from "ἐνκρατῆ" to "ἐγκρατῆ".
 * @param filePath
 */
export const fixProjectAlignmentTopWords = function (filePath) {
  const match = 'ἐνκρατῆ';
  const replace = 'ἐγκρατῆ';
  // To clean up lemma:
  const match2 = 'ἐνκρατής';
  const replace2 = 'ἐγκρατής';
  let modified = false;

  try {
    const chapter_alignments = fs.readJsonSync(filePath);

    for (let verseKey in chapter_alignments) {
      const verse = chapter_alignments[verseKey];

      for (let alignment of verse.alignments) {
        for (let word of alignment.topWords) {
          if (word.word === match) {
            word.word = replace;
            modified = true;

            if (word.lemma === match2) {
              word.lemma =replace2;
            }
          }
        }
      }
    }

    if (modified) {
      fs.outputJsonSync(filePath, chapter_alignments, { spaces: 2 });
    }
  } catch (e) {
    console.warn('Error opening chapter alignment \'' + filePath + '\': ' + e.toString());
  }
};

