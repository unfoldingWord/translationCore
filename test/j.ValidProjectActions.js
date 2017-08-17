import {describe, it} from 'mocha';
import { expect } from 'chai';
import path from 'path-extra';
import fs from 'fs-extra';

import * as LoadHelpers from '../src/js/helpers/LoadHelpers';
import * as loadOnline from '../src/js/helpers/LoadOnlineHelpers.js';

var workingProjectExpectedPath = path.join(path.homedir(), 'translationCore', 'projects', 'id_-co_text_reg');
var missingVerseExpectedPath = path.join(path.homedir(), 'translationCore', 'projects', 'bes_tit_text_reg');
var mergeConflictExpectedPath = path.join(path.homedir(), 'translationCore', 'projects', 'ceb_2ti_text_ulb_L2');

var missingVerseProjectURL = 'https://git.door43.org/royalsix/bes_tit_text_reg.git';
var mergeConflictProjectURL = 'https://git.door43.org/royalsix/ceb_2ti_text_ulb_L2.git';
function getProjects() {
  return new Promise((resolve, reject) => {
    loadOnline(missingVerseProjectURL, () => {
      loadOnline(mergeConflictProjectURL, resolve);
    });
  });
}

getProjects()
.then(() => {
  describe('Valid Project Actions', () => {
    it('should return project is missing verses', function (done) {
      var isMissing = LoadHelpers.projectIsMissingVerses(missingVerseExpectedPath, 'tit');
      expect(isMissing).to.be.true;
      done();
    })
    it('should return project is not missing verses', function (done) {
      var isMissing = LoadHelpers.projectIsMissingVerses(workingProjectExpectedPath, '1co');
      expect(isMissing).to.be.false;
      done();
    })
    it('should return project has merge conflicts', function (done) {
      var hasMergeConflict = LoadHelpers.projectHasMergeConflicts(mergeConflictExpectedPath, '2ti');
      expect(hasMergeConflict).to.be.true;
      done();
    })
    it('should return project has no merge conflicts', function (done) {
      var hasMergeConflict = LoadHelpers.projectHasMergeConflicts(missingVerseExpectedPath, 'tit');
      expect(hasMergeConflict).to.be.false;
      fs.removeSync(missingVerseExpectedPath);
      fs.removeSync(mergeConflictExpectedPath);
      fs.removeSync(workingProjectExpectedPath);
      done();
    })
  })
}).catch((err) => console.log(err))
