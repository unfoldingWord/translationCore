const assert = require('chai').assert;
const ImportUSFM = require('../src/js/components/core/usfm/ImportUSFM.js');
var parsedBook;
var testAbbr = 'mrk', testSave = './tests/testIO', testDir = 'ltr';
var testFile = './tests/static/3john.usfm';


describe('ImportUSFM.saveParamsInAPI', function() {
  it('ImportUSFM.saveParamsInAPI should save the parameters in API', function(){
    assert.equal(ImportUSFM.saveParamsInAPI(), 'Missing params');
    ImportUSFM.saveParamsInAPI(testAbbr, testSave, testDir);
    var params = ModuleApi.getDataFromCommon('params');
    assert.equal(params.direction, testDir);
    assert.equal(params.targetLanguagePath, testSave);
    assert.equal(params.bookAbbr, testAbbr);
  });
});

describe('ImportUSFM.createTCProject', function() {
  it('ImportUSFM.createTCProject takes in a file path, parses the usfm file, and saves it to a save location', function(done){
    ImportUSFM.createTCProject(testFile, function(parsedUSFM, saveLocation) {
      parsedBook = parsedUSFM;
      assert.isObject(parsedUSFM);
      assert.isObject(parsedUSFM.headers);
      assert.isArray(parsedUSFM.chapters);
      assert.isString(saveLocation);
      done()
    });
  });
});

describe('ImportUSFM.saveTargetLangeInAPI', function() {
  it('ImportUSFM.saveTargetLangeInAPI takes in the JSON object and saves it in the api', function(){
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
  it('ImportUSFM.openUSFMProject does all of the above', function(){
    ImportUSFM.open(testFile, testDir);
    var CheckStore = ModuleApi.logCheckStore().common;
    assert.isString(CheckStore.saveLocation);
    assert.isObject(CheckStore.params);
    assert.isObject(CheckStore.targetLanguage);
  });
});
