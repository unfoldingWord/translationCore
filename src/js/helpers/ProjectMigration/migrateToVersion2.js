import path from 'path';
import * as fs from 'fs-extra';
import * as Version from './VersionUtils';

export const MIGRATE_MANIFEST_VERSION = 2;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, projectLink) => {
  Version.getVersionFromManifest(projectPath, projectLink); // ensure manifest converted for tc
  if (shouldRun(projectPath)) run(projectPath);
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
  convertStrongstoStrong(projectPath);
  //TODO: fix occurrence(s) errors
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

const convertStrongstoStrong = function (projectPath) {
  const projectAlignmentDataPath = path.join(projectPath, '.app', 'translationCore', 'alignmentData');
  if (fs.existsSync(projectAlignmentDataPath)) {
    const alignmentFolders = fs.readdirSync(projectAlignmentDataPath);
    for (let folder of alignmentFolders) {
      const alignmentPath = path.join(projectAlignmentDataPath, folder);
      const files = fs.readdirSync(alignmentPath).filter((file) => (path.extname(file) === '.json'));
      for (let file of files) {
        const file_path = path.join(alignmentPath, file);
        let modified = false;
        const chapter = fs.readJsonSync(file_path);
        for (let verse of Object.keys(chapter)) {
          for (let alignment of chapter[verse].alignments) {
            for (let word of alignment.topWords) {
              if (word.strongs) {
                word.strong = word.strongs;
                delete word.strongs;
                modified = true;
              }
            }
          }
        }
        if (modified) {
          fs.outputJsonSync(file_path, chapter);
        }
      }
    }
  }
};
