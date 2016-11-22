/**
  * TODO:
  * 1. Event listener testing. Includes register, remove, and emit.
  * 2. CheckStore testing. Includes put and get.
  * 3. IO testing. Input and Ouput JSON, along with text. No clue how to test.
  * 4. CheckStore logging. No clue how to test.
  * 5. Alert creation and clearing. No clue how to test.
  * 6. Initialize CheckStore.
  * 7. Get logged in user. No clue how to log in an user.
  * 8. Update manifest.
  * 9. Save project.
  * 10. Settings API.
  * After this stuff, CoreStore and CoreActions can be tested, also with electron-mocha
  *
  * Also TODO, stuff inside constructor:
  * 1. React
  * 2. ReactBootstrap
  * 3. CheckModule
  * 4. Modules
  * 5. GitApi
  * 6. PopoverApi
  * 7. NotificationApi
  * 8. ReportFilters and tools
  * 9. Inital git status.
  * For stuff inside the constructor, maybe there should just be a test to check the types.
  *****************************************************************************/
const chai = require('chai');
const assert = chai.assert;
require('../src/js/pages/index');
const ModuleApi = require('../src/js/ModuleApi.js');

function addDataToCommon() {
  ModuleApi.putDataInCommon('testString', 'This is a test string');
  ModuleApi.putDataInCommon('testObject', {id: 'Test object'});
  ModuleApi.putDataInCommon('testNumber', 42);
}

function setUpMenus() {
  var sampleMenu = {menu: ["1", "2"]};
  ModuleApi.saveMenu('testMenu', sampleMenu);
}

describe('ModuleApi.convertToFullBookName', function() {
  it('convertToFullBookName should return the full book name based on abbreviation.', function() {
    var mrk = 'mrk';
    var mrkUpper = 'MRK';
    var mrkExpected = 'Mark';
    var unexpectedValue = 'abc';
    assert.equal(ModuleApi.convertToFullBookName(mrk), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(mrkUpper), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(unexpectedValue), undefined);
  });
});

describe('ModuleApi.convertToBookAbbreviation', function() {
  it('convertToBookAbbreviation should return the book abbreviation based on full name.', function() {
    var mark = 'Mark';
    var markUpper = 'MARK';
    var markExpected = 'mrk';
    var unexpectedValue = 'abcd';
    assert.equal(ModuleApi.convertToBookAbbreviation(mark), markExpected);
    assert.equal(ModuleApi.convertToBookAbbreviation(markUpper), markExpected);
    assert.equal(ModuleApi.convertToBookAbbreviation(unexpectedValue), undefined);
  });
});

describe('ModuleApi.putDataInCommon and ModuleApi.getDataFromCommon', function() {
  it('getDataFromCommon should return data that was from putDataInCommon', function() {
    var expectedString = 'This is a test string';
    var expectedObject = 'Test object';
    var expectedNumber = 42;
    var unexpectedValue = 'abc';
    assert.equal(ModuleApi.getDataFromCommon('testString'), undefined);
    addDataToCommon();
    assert.equal(ModuleApi.getDataFromCommon('testString'), expectedString);
    assert.isString(ModuleApi.getDataFromCommon('testString'));
    assert.equal(ModuleApi.getDataFromCommon('testObject').id, expectedObject);
    assert.isObject(ModuleApi.getDataFromCommon('testObject'));
    assert.equal(ModuleApi.getDataFromCommon('testNumber'), expectedNumber);
    assert.isNumber(ModuleApi.getDataFromCommon('testNumber'));
    assert.equal(ModuleApi.getDataFromCommon(unexpectedValue), undefined);

  });
});

describe('ModuleApi.getAuthToken', function() {
  it('getAuthToken should return an auth token, of type string.', function() {
    var unexpectedValue = 'abc';
    assert.isString(ModuleApi.getAuthToken('git'));
    assert.isString(ModuleApi.getAuthToken('gogs'));
    assert.equal(ModuleApi.getAuthToken(unexpectedValue), undefined);
  });
});

describe('ModuleApi.saveMenu and ModuleApi.getMenu', function() {
  it('getMenu should return an function, after a menu is saved.', function() {
    var unexpectedValue = 'abc';
    assert.equal(ModuleApi.getMenu(), null);
    setUpMenus();
    assert.isObject(ModuleApi.getMenu('testMenu'));
    assert.isArray(ModuleApi.getMenu('testMenu').menu);
    assert.isString(ModuleApi.getMenu('testMenu').menu[0]);
    assert.isFunction(ModuleApi.getMenu(unexpectedValue));
  });
});

describe('ModuleApi.getGatewayLanguageAndSaveInCheckStore', function() {
  it('getGatewayLanguageAndSaveInCheckStore should put a gateway language in the checkstore.', function(done) {
    this.timeout(50000);
    var params = {
      bookAbbr: '3jn'
    };
    function progressCallback() {};
    assert.equal(ModuleApi.getDataFromCommon('gatewayLanguage'), undefined);
    ModuleApi.getGatewayLanguageAndSaveInCheckStore(params, progressCallback, function(data) {
      assert.isObject(data);
      assert.isArray(data.chapters);
      assert.isObject(ModuleApi.getDataFromCommon('gatewayLanguage'));
      done();
    });
  });
});
