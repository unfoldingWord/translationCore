import * as LoadHelpers from '../src/js/helpers/LoadHelpers';
import consts from '../src/js/actions/ActionTypes';
import { expect, assert } from 'chai';
const path = require('path-extra');
const fs = require('fs-extra');
const loadOnline = require('../src/js/components/LoadOnline.js');
var missingVerseExpectedPath = path.join(path.homedir(), 'translationCore', 'bes_tit_text_reg');
var mergeConflictExpectedPath = path.join(path.homedir(), 'translationCore', 'ceb_2ti_text_ulb_L2');

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
                var isMissing = LoadHelpers.projectIsMissingVerses('tit', missingVerseExpectedPath);
                expect(isMissing).to.be.true;
                done();
            })
            it('should return project is not missing verses', function (done) {
                var isMissing = LoadHelpers.projectIsMissingVerses('tit', mergeConflictExpectedPath);
                expect(isMissing).to.be.false;
                done();
            })
            it('should return project has merge conflicts', function (done) {
                var hasMergeConflict = LoadHelpers.projectHasMergeConflicts('2ti', mergeConflictExpectedPath);
                expect(hasMergeConflict).to.be.true;
                done();
            })
            it('should return project has no merge conflicts', function (done) {
                var hasMergeConflict = LoadHelpers.projectHasMergeConflicts('tit', missingVerseExpectedPath);
                expect(hasMergeConflict).to.be.false;
                done();
            })
        })
    }).catch((err) => console.log(err))