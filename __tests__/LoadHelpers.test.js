/* eslint-disable no-console */
/* eslint-env jest */

// TODO: import statement is not working????

import fs from 'fs-extra';
import path from 'path-extra';

import * as LoadHelpers from '../src/js/helpers/LoadHelpers';
import * as loadOnline from '../src/js/helpers/LoadOnlineHelpers.js';

const workingProjectExpectedPath = path.join(path.homedir(), 'translationCore', 'projects', 'id_-co_text_reg');
const missingVerseExpectedPath = path.join(path.homedir(), 'translationCore', 'projects', 'bes_tit_text_reg');
const mergeConflictExpectedPath = path.join(path.homedir(), 'translationCore', 'projects', 'ceb_2ti_text_ulb_L2');

const missingVerseProjectURL = 'https://git.door43.org/royalsix/bes_tit_text_reg.git';
const mergeConflictProjectURL = 'https://git.door43.org/royalsix/ceb_2ti_text_ulb_L2.git';

function getProjects() {
  return new Promise((resolve) => {
    loadOnline(missingVerseProjectURL, () => {
      loadOnline(mergeConflictProjectURL, resolve);
    });
  });
}

getProjects()
.then(() => {
  describe('Valid Project Actions', () => {
    test('should return project is missing verses', () => {
        const isMissing = LoadHelpers.projectIsMissingVerses(missingVerseExpectedPath, 'tit');
        expect(isMissing).toBeTruthy();
    });

    test('should return project is not missing verses', () => {
        const isMissing = LoadHelpers.projectIsMissingVerses(workingProjectExpectedPath, '1co');
        expect(isMissing).not.toBeTruthy();
    });

    test('should return project has merge conflicts', () => {
        const hasMergeConflict = LoadHelpers.projectHasMergeConflicts(mergeConflictExpectedPath, '2ti');
        expect(hasMergeConflict).toBeTruthy();
    });

    test('should return project has no merge conflicts', () => {
      const hasMergeConflict = LoadHelpers.projectHasMergeConflicts(missingVerseExpectedPath, 'tit');
      expect(hasMergeConflict).not.toBeTruthy();
      fs.removeSync(missingVerseExpectedPath);
      fs.removeSync(mergeConflictExpectedPath);
      fs.removeSync(workingProjectExpectedPath);
    })
  })
}).catch((err) => console.log(err));
