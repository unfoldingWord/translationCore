const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const CheckDataGrabber = require('../src/js/components/core/create_project/CheckDataGrabber.js');
const CheckStore = require('../src/js/stores/CheckStore.js')
const path = require('path-extra');
const api = window.ModuleApi;

const PARENT = path.datadir('translationCore')
const PACKAGE_SAVE_LOCATION = path.join(PARENT, 'packages');

const testTool = path.join(PACKAGE_SAVE_LOCATION, 'ExampleChecker');
const testCheckArray = null;

describe('CheckDataGrabber.fetchModules', function () {
    it('should fetch a module from online', function (done) {
        CheckDataGrabber.fetchModules(testCheckArray, function (err, success) {
            assert.isObject(api.getDataFromCommon('params'));
            assert.isNotTrue(success);
            expect(api.getDataFromCommon('arrayOfChecks')).to.exist;
            (api.modules).should.be.empty;
            (CheckDataGrabber.doneModules).should.equal(0);
            (CheckDataGrabber.totalModules).should.equal(0);
            done();
        });
    });
});

describe('CheckDataGrabber.loadModuleAndDependencies', function () {
    it('should load a tool', function (done) {
        CheckDataGrabber.loadModuleAndDependencies(testTool, function (err, success) {
            assert.isObject(api.getDataFromCommon('params'));
            assert.isNotFalse(success);
            expect(api.getDataFromCommon('arrayOfChecks')).to.exist;
            (api.modules).should.not.be.empty;
            (CheckDataGrabber.totalModules).should.not.equal(0);
            (CheckDataGrabber.doneModules).should.not.equal(0);
            done();
        });
    });
});

