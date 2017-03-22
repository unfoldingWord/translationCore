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
const Upload = require('../src/js/components/core/UploadMethods.js');
const CheckStore = require('../src/js/stores/CheckStore.js')
const path = require('path-extra');
const api = window.ModuleApi;
var fs = require('fs');

const testProjectPath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
const testUSFMProjectPath = path.join(window.__base, '/tests/static/3john');
const noTCManifestProject = path.join(window.__base, '/tests/static/id_-co_text_reg');
const undefinedProject = path.join(window.__base, '/tests/static/JesusSaves');

describe('Upload.sendPath(undefined project)', function () {
    it('should fail', function (done) {
        Upload.sendPath(undefinedProject, null, function () {
            assert.isNotOk(api.getDataFromCommon('tcManifest'));
            assert.isNotOk(api.getDataFromCommon('saveLocation'));
            assert.isNotOk(api.getDataFromCommon('params'));
            assert.isNotOk(api.getDataFromCommon('targetLanguage'));
            api.inputJson(undefinedProject + '/tc-manifest.json', function (err, data) {
                if (!err) {
                    assert.equal(true, false);
                } else {
                    assert.isNotOk(data);
                }
                api.outputJson(noTCManifestProject + '/tc-manifest.json', null, function () {
                    done();
                });
            });
        });
    });
});

describe('Upload.sendPath(USFM project)', function () {
    it('should load a USFM project', function (done) {
      this.timeout(50000);
        Upload.sendPath(testUSFMProjectPath, null, function () {
            assert.isObject(api.getDataFromCommon('tcManifest'));
            assert.isString(api.getDataFromCommon('saveLocation'));
            assert.isObject(api.getDataFromCommon('params'));
            assert.isObject(api.getDataFromCommon('targetLanguage'));
            api.inputJson(testUSFMProjectPath + '/tc-manifest.json', function (err, data) {
                if (err || !data) {
                    assert.equal(true, false);
                } else {
                    assert.isObject(data);
                    assert(data.target_language);
                }
                done();
            });
        });
    });
});

describe('Upload.sendPath(non-USFM project)', function () {
    it('should load a regular project', function (done) {
        Upload.sendPath(testProjectPath, null, function (err, data) {
          assert.isUndefined(err);
          done();
        });
    });
});

describe('Upload.getParams(testProjectPath)', function () {
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

describe('Upload.getParams(testUSFMProjectPath)', function () {
    it('should generate and return correct parameters for a project', function (done) {
        var params = Upload.getParams(testUSFMProjectPath);
        expect(params.originalLanguagePath).to.be.string;
        expect(params.bookAbbr).to.be.string;
        expect(params.targetLanguagePath).to.be.string;
        expect(params.gatewayLanguage).to.be.object;
        expect(params.direction).to.be.string;
        expect(params.originalLanguage).to.be.string;
        done();
    });
});

describe('Upload.getParams(noTCManifestProject)', function () {
    it('should still generate and return correct parameters for a project even with missing fields', function (done) {
        var params = Upload.getParams(noTCManifestProject);
        expect(params.originalLanguagePath).to.be.string;
        expect(params.bookAbbr).to.be.string;
        expect(params.targetLanguagePath).to.be.string;
        expect(params.gatewayLanguage).to.be.object;
        expect(params.direction).to.be.string;
        expect(params.originalLanguage).to.be.string;
        done();
    });
});

describe('Upload.getParams(undefinedProject)', function () {
    it('should fail', function (done) {
        api.putDataInCommon('tcManifest', null);
        var params = Upload.getParams(undefinedProject);
        assert.isNotOk(params);
        done();
    });
});


describe('Upload.checkIfUSFMProject(USFM project)', function () {
    it('should return the target language of test USFM project', function (done) {
        var params = Upload.checkIfUSFMProject(testUSFMProjectPath, function (targetLanguage) {
            if (targetLanguage) {
                expect(targetLanguage.title).to.be.string;
                expect(targetLanguage[1]).to.be.object;
                assert.isString(api.getDataFromCommon('saveLocation'));
                assert.isObject(api.getDataFromCommon('targetLanguage'));
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
