import fs from 'fs-extra';
import path from 'path-extra';
import {
  copyAlignmentData,
  createVerseEditsForAllChangedVerses,
  getBookId,
} from './ProjectOverwriteHelpers';

/**
 * @description Recursively copies check data files from one checkData folder to another,
 * only copying files that do not already exist at the destination. Check data file names
 * are unique timestamps, so a file-level union is safe - the check data reducers pick the
 * latest item by timestamp.
 * @param {String} fromDir - checkData folder to copy from
 * @param {String} toDir - checkData folder to copy into
 */
export const unionCheckData = (fromDir, toDir) => {
  if (!fs.existsSync(fromDir)) {
    return;
  }

  const entries = fs.readdirSync(fromDir);

  for (const entry of entries) {
    const fromPath = path.join(fromDir, entry);
    const toPath = path.join(toDir, entry);

    if (fs.lstatSync(fromPath).isDirectory()) {
      unionCheckData(fromPath, toPath);
    } else if (!fs.existsSync(toPath)) {
      fs.copySync(fromPath, toPath);
    }
  }
};

/**
 * @description Merges the local project's data into a fresh clone of the remote (Door43) project
 * so that both the local user's work and the remote collaborators' work survive:
 * - the local .apps checking data is used as the base
 * - the remote's alignment data is overlaid per verse where it has alignments (same behavior
 *   as the import overwrite merge in ProjectOverwriteHelpers)
 * - remote checkData files that are absent locally are unioned in
 * - manifest checkers/translators are unioned
 * - external verse edits are recorded and stale selections invalidated for verses whose text
 *   changed on the remote
 * TRICKY: unlike ProjectOverwriteHelpers.mergeOldProjectToNewProject, the clone's .git folder is
 * deliberately left in place - it contains the remote HEAD, so the commit made after this merge
 * can be pushed as a simple fast-forward.
 * @param {String} localProjectPath - path of the existing local project
 * @param {String} clonePath - path of the fresh clone of the remote project
 * @param {String} userName - logged in user name
 * @param {Function} dispatch
 */
export const mergeLocalIntoRemoteClone = (localProjectPath, clonePath, userName, dispatch) => {
  console.log(`mergeLocalIntoRemoteClone(${localProjectPath}, ${clonePath})`);
  const localAppsPath = path.join(localProjectPath, '.apps');
  const cloneAppsPath = path.join(clonePath, '.apps');

  if (fs.existsSync(localAppsPath)) {
    if (!fs.existsSync(cloneAppsPath)) {
      // no checking data on the remote, so we just copy over the local .apps folder
      console.log('mergeLocalIntoRemoteClone() - no checking data in remote project');
      fs.copySync(localAppsPath, cloneAppsPath);
    } else {
      console.log('mergeLocalIntoRemoteClone() - checking data in remote project, merging');
      const bookId = getBookId(clonePath);
      const tempAppsPath = path.join(clonePath, '.temp_apps');
      fs.moveSync(cloneAppsPath, tempAppsPath); // set the remote's .apps aside
      fs.copySync(localAppsPath, cloneAppsPath); // the local checking data is the base
      // overlay the remote's alignment data where it has alignments
      const tempAlignmentPath = path.join(tempAppsPath, 'translationCore', 'alignmentData', bookId);

      if (fs.existsSync(tempAlignmentPath)) {
        copyAlignmentData(tempAlignmentPath, path.join(cloneAppsPath, 'translationCore', 'alignmentData', bookId));
      }
      // union in remote check data files that are absent locally
      unionCheckData(path.join(tempAppsPath, 'translationCore', 'checkData'),
        path.join(cloneAppsPath, 'translationCore', 'checkData'));
      fs.removeSync(tempAppsPath);
    }
  }

  mergeManifests(localProjectPath, clonePath);
  dispatch(createVerseEditsForAllChangedVerses(localProjectPath, clonePath, userName));
  console.log('mergeLocalIntoRemoteClone() - finished');
};

/**
 * @description merges the checkers and translators of the local manifest into the clone's
 * manifest (same union logic as ProjectOverwriteHelpers.mergeOldProjectToNewProject) and
 * writes the merged manifest to the clone.
 * @param {String} localProjectPath
 * @param {String} clonePath
 */
export const mergeManifests = (localProjectPath, clonePath) => {
  const localManifestPath = path.join(localProjectPath, 'manifest.json');
  const cloneManifestPath = path.join(clonePath, 'manifest.json');

  if (!fs.existsSync(localManifestPath) || !fs.existsSync(cloneManifestPath)) {
    return;
  }

  const localManifest = fs.readJsonSync(localManifestPath);
  const cloneManifest = fs.readJsonSync(cloneManifestPath);
  const localCheckers = localManifest.checkers || [];
  const localTranslators = localManifest.translators || [];
  // filter duplicate checkers items
  const newCheckers = (cloneManifest.checkers || []).filter(checker => !localCheckers.includes(checker));
  // filter duplicate translators items
  const newTranslators = (cloneManifest.translators || []).filter(translator => !localTranslators.includes(translator));
  const mergedManifest = {
    ...localManifest,
    ...cloneManifest,
    checkers: [...localCheckers, ...newCheckers],
    translators: [...localTranslators, ...newTranslators],
  };
  fs.outputJsonSync(cloneManifestPath, mergedManifest, { spaces: 2 });
};
