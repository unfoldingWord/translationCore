const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const CheckDataGrabber = require('../src/js/components/core/create_project/CheckDataGrabber.js');
const CheckStore = require('../src/js/stores/CheckStore.js')
const path = require('path-extra');
const api = window.ModuleApi;

const testTool = './static/ExampleChecker';

describe('CheckDataGrabber.loadModuleAndDependencies', function () {
    it('should load a tool', function (done) {
        CheckDataGrabber.loadModuleAndDependencies(testTool);
        expect(api.getDataFromCommon('arrayOfChecks')).to.exist;
        done();
    });
});