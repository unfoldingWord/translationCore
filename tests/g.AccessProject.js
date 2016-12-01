const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const Access = require('../src/js/components/core/AccessProject.js');
const CheckStore = require('../src/js/stores/CheckStore.js')
const path = require('path-extra');
const api = window.ModuleApi;

const testProjectPath = './static/id_3jn_text_ulb';
const testUSFMProjectPath = './static/60JASOSJNT';

describe('Access.loadFromFilePath', function () {
    it('should load a project with relevant files from folderpath', function (done) {
        Access.loadFromFilePath(testProjectPath, done);
    });
});

describe('Access.loadCheckData', function () {
    it('should put the checkdata from filepath into checkstore', function (done) {
        Access.loadCheckData(testProjectPath + '/checkdata', testProjectPath, function(){
            expect(CheckStore.storeData).to.not.equal({});
            expect(localStorage.getItem('lastProject')).to.exist;
            done();
        });
    });
});