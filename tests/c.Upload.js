/**
 * Functions that need to be tested for Upload.js, as of now.
 *
 * 1. clearPreviousData - Somewhat Important                            ✓
 * 2. sendPath - Important                                              ✓
 * 3. loadFile - Somewhat Important (TESTED THROUGH SENDPATH)           ✓
 * 4. loadProjectThatHasManifest (TESTED THROUGH SENDPATH)              ✓
 * 5. getParams - Important                                             ✓
 * 6. saveTargetLangeInAPI - Important                                  ✓
 * 7. checkIfUSFMProject                                                ✓
 * 8. saveManifest - Important (TESTED THROUGH SENDPATH)                ✓
 * 9. fixManifestVerThree - Somewhat Important (TESTED THROUGH SENDPATH)✓
 * 10. manifestError                                                    ✘
 * 11. isOldTestament - Somewhat Important (TESTED THROUGH SENDPATH)    ✓
 ******************************************************************************/
const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const Upload = require('../src/js/components/core/Upload.js');
const CheckStore = require('../src/js/stores/CheckStore.js')
const path = require('path-extra');
const api = window.ModuleApi;
var fs = require('fs');

const testProjectPath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
const testUSFMProjectPath = path.join(window.__base, '/tests/static/3john');

describe('Upload.sendFilePath(USFM project)', function () {
    it('should load a USFM project', function (done) {
        this.timeout(50000);
        Upload.sendFilePath(testUSFMProjectPath, null, function() {
            assert.isObject(api.getDataFromCommon('tcManifest'));
            assert.isString(api.getDataFromCommon('saveLocation'));
            assert.isObject(api.getDataFromCommon('params'));
            done();
        });
    });
});

describe('Upload.sendFilePath(non-USFM project)', function () {
    it('should load a regular project', function (done) {
        this.timeout(50000);
        Upload.sendFilePath(testProjectPath, null, function() {
            assert.isObject(api.getDataFromCommon('tcManifest'));
            assert.isString(api.getDataFromCommon('saveLocation'));
            assert.isObject(api.getDataFromCommon('params'));
            done();
        });
    });
});

describe('Upload.getParams', function () {
    it('should generate and return correct parameters for a project', function (done) {
        var params = Upload.getParams(testProjectPath);
        expect(params.originalLanguagePath).to.be.string;
        expect(params.bookAbbr).to.be.string;
        expect(params.targetLanguagePath).to.be.string;
        expect(params.gatewayLanguage).to.be.object;
        expect(params.direction).to.be.string;
        expect(params.originalLanguage).to.be.string;
        done();
    });
});

describe('Upload.checkIfUSFMProject(USFM project)', function () {
    it('should return the target language of test USFM project', function (done) {
        var params = Upload.checkIfUSFMProject(testUSFMProjectPath, function (targetLanguage) {
            if (targetLanguage) {
                expect(targetLanguage.title).to.be.string;
                expect(targetLanguage[1]).to.be.object;
                done();
            }
        });
    });
});

describe('Upload.checkIfUSFMProject(non-USFM project)', function () {
    it('should return null because its not a USFM project', function (done) {
        var params = Upload.checkIfUSFMProject(testProjectPath, function (targetLanguage) {
            expect(targetLanguage).to.not.exist;
            done();
        });
    });
});
