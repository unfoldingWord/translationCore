const assert = require('chai').assert;
const ImportUSFM = require('../src/js/components/core/Usfm/ImportUSFM.js');
var parsedBook;
var testAbbr = 'mrk', testSave = './tests/testIO', testDir = 'ltr';
var testFile = './tests/static/3john/3john.usfm';


describe('ImportUSFM.saveParamsInAPI', function() {
  it('saveParamsInAPI should return an error if no params are specified', function() {
    assert.equal(ImportUSFM.saveParamsInAPI(), 'Missing params');
  });
  it('saveParamsInAPI should save the parameters in API', function(){
    ImportUSFM.saveParamsInAPI(testAbbr, testSave, testDir);
    var params = ModuleApi.getDataFromCommon('params');
    assert.equal(params.direction, testDir);
    assert.equal(params.targetLanguagePath, testSave);
    assert.equal(params.bookAbbr, testAbbr);
  });
});

describe('ImportUSFM.createTCProject', function() {
  it('createTCProject should return an error if no file path is specified', function() {
    var res = ImportUSFM.createTCProject(null, function() {
      assert.isTrue(false);
    });
    assert.isString(res);
    assert.equal(res, 'No save path or callback specified');
  });
  it('createTCProject should return an error if no callback is specified', function() {
    var res = ImportUSFM.createTCProject(testFile, null);
    assert.isString(res);
    assert.equal(res, 'No save path or callback specified');
  });
  it('createTCProject takes in a file path, parses the usfm file, and saves it to a save location', function(done){
    ImportUSFM.createTCProject(testFile, function(parsedUSFM, projectSaveLocation) {
      parsedBook = parsedUSFM;
      assert.isObject(parsedUSFM);
      assert.isObject(parsedUSFM.headers);
      assert.isArray(parsedUSFM.chapters);
      assert.isString(projectSaveLocation);
      done()
    });
  });
});

describe('ImportUSFM.saveTargetLangeInAPI', function() {
  it('saveTargetLangeInAPI should return undefined if no targetLanguage is passed in', function() {
    assert.isUndefined(ImportUSFM.saveTargetLangeInAPI());
  });
  it('saveTargetLangeInAPI takes in the JSON object and saves it in the api', function(){
    var targetLanguage = ImportUSFM.saveTargetLangeInAPI(parsedBook);
    var savedTargetLanguage = ModuleApi.getDataFromCommon('targetLanguage');
    assert.equal(savedTargetLanguage, targetLanguage);
    assert.isObject(targetLanguage);
    assert.isObject(savedTargetLanguage);
    assert.isString(savedTargetLanguage.title);
    assert.isString(targetLanguage.title);
  });
});

describe('ImportUSFM.openUSFMProject', function() {
  it('openUSFMProject should return an error if no file is specified', function() {
    assert.equal(ImportUSFM.open(null, testDir), 'No file or text direction specified');
  });
  it('openUSFMProject should return an error if no text direction is specified', function() {
    assert.equal(ImportUSFM.open(testFile, null), 'No file or text direction specified');
  });
  it('openUSFMProject should open a usfm file and load it to memory', function(){
    ImportUSFM.open(testFile, testDir);
    var CheckStore = ModuleApi.logCheckStore().common;
    assert.isString(CheckStore.projectSaveLocation);
    assert.isObject(CheckStore.params);
    assert.isObject(CheckStore.targetLanguage);
  });
});
