const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const Access = require('../src/js/components/core/AccessProject.js');
const CheckStore = require('../src/js/stores/CheckStore.js')
const path = require('path-extra');
const api = window.ModuleApi;

const testProjectPath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');

describe('Access.loadFromFilePath', function () {
    it('should callback an error if a null filepath is passed', function(done) {
      Access.loadFromFilePath(null, function(err) {
        assert.isDefined(err);
        assert.isString(err);
        assert.equal('Must specify location', err);
        done();
      });
    });
    it('should return an error if a null filepath is passed and no callback is specified', function() {
      var err = Access.loadFromFilePath();
      assert.isDefined(err);
      assert.isString(err);
      assert.equal('Must specify location', err);
    });
    it('should return an error if an invalid filepath is passed filepath', function() {
      Access.loadFromFilePath(testProjectPath+"dskldffsjlk", function(err) {
        assert.isDefined(err);
        done();
      });
    });
    it('should load a project with relevant files from folderpath', function (done) {
        Access.loadFromFilePath(testProjectPath, function(err) {
          var newCheckStore = ModuleApi.logCheckStore();
          assert.isUndefined(err);
          assert.isObject(newCheckStore);
          done();
        });
    });
});

describe('Access.loadCheckData', function () {
  it('should callback an error if no path is specified', function (done) {
      Access.loadCheckData(null, null, function(err){
        assert.isString(err);
        assert.equal('No checkdata or save path specified', err);
        done();
      });
  });
  it('should return an error if no path is specified', function () {
      var err = Access.loadCheckData()
      assert.equal('No checkdata or save path specified', err);
      assert.isString(err);
  });
  it('should callback error if invalid project path', function (done) {
      Access.loadCheckData(testProjectPath + 'fskld/checkdata', testProjectPath +'dfkld', function(err){
        assert.isDefined(err);
        done();
      });
  });
  it('should put the checkdata from filepath into checkstore', function (done) {
      Access.loadCheckData(testProjectPath + '/checkdata', testProjectPath, function(){
        expect(CheckStore.storeData).to.not.equal({});
        expect(localStorage.getItem('lastProject')).to.exist;
        done();
      });
  });
});
