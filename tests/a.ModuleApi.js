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
  ModuleApi.putDataInCommon('testObject', { id: 'Test object' });
  ModuleApi.putDataInCommon('testNumber', 42);
}

function setUpMenus() {
  var sampleMenu = { menu: ["1", "2"] };
  ModuleApi.saveMenu('testMenu', sampleMenu);
}


describe('ModuleApi.constructor', function () {
  it('constructor should set instance variables correctly.', function () {
    assert.isObject(ModuleApi.React);
    assert.isFunction(ModuleApi.React.createElement);

    assert.isObject(ModuleApi.ReactBootstrap);
    assert.isFunction(ModuleApi.ReactBootstrap.Col);

    assert.isFunction(ModuleApi.CheckModule);
    assert.isObject(new ModuleApi.CheckModule());
    assert.isFunction(new ModuleApi.CheckModule().goToNext);

    assert.isObject(ModuleApi.modules);

    assert.isFunction(ModuleApi.Popover);

    assert.isObject(ModuleApi.Toast);
    assert.isFunction(ModuleApi.Toast.info);

    assert.isFunction(ModuleApi.Git);
    assert.isObject(ModuleApi.Git());
    assert.isFunction(ModuleApi.Git().commit);

    assert.isObject(ModuleApi.ReportFiltersTools);
    assert.isObject(ModuleApi.ReportFilters);
    assert.isFunction(ModuleApi.ReportFilters.byGroup);

    assert.isArray(ModuleApi.gitStack);
    assert.equal(ModuleApi.gitDone, true);
  });
});

describe('ModuleApi.convertToFullBookName', function () {
  it('convertToFullBookName should return the full book name based on abbreviation.', function () {
    var mrk = 'mrk';
    var mrkUpper = 'MRK';
    var mrkExpected = 'Mark';
    var unexpectedValue = 'abc';
    assert.equal(ModuleApi.convertToFullBookName(mrk), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(mrkUpper), mrkExpected);
    assert.isUndefined(ModuleApi.convertToFullBookName(unexpectedValue));
  });
});

describe('ModuleApi.convertToBookAbbreviation', function () {
  it('convertToBookAbbreviation should return the book abbreviation based on full name.', function () {
    var mark = 'Mark';
    var markUpper = 'MARK';
    var markExpected = 'mrk';
    var unexpectedValue = 'abcd';
    assert.equal(ModuleApi.convertToBookAbbreviation(mark), markExpected);
    assert.equal(ModuleApi.convertToBookAbbreviation(markUpper), markExpected);
    assert.isUndefined(ModuleApi.convertToBookAbbreviation(unexpectedValue));
  });
});

describe('ModuleApi.putDataInCommon and ModuleApi.getDataFromCommon', function () {
  it('getDataFromCommon should return data that was from putDataInCommon', function () {
    var expectedString = 'This is a test string';
    var expectedObject = 'Test object';
    var expectedNumber = 42;
    var unexpectedValue = 'abc';
    assert.isNull(ModuleApi.getDataFromCommon('testString'));
    addDataToCommon();
    assert.equal(ModuleApi.getDataFromCommon('testString'), expectedString);
    assert.isString(ModuleApi.getDataFromCommon('testString'));
    assert.equal(ModuleApi.getDataFromCommon('testObject').id, expectedObject);
    assert.isObject(ModuleApi.getDataFromCommon('testObject'));
    assert.equal(ModuleApi.getDataFromCommon('testNumber'), expectedNumber);
    assert.isNumber(ModuleApi.getDataFromCommon('testNumber'));
    assert.isUndefined(ModuleApi.getDataFromCommon(unexpectedValue));

  });
});

describe('ModuleApi.getAuthToken', function () {
  it('getAuthToken should return an auth token, of type string.', function () {
    var unexpectedValue = 'abc';
    assert.isString(ModuleApi.getAuthToken('git'));
    assert.isString(ModuleApi.getAuthToken('gogs'));
    assert.isUndefined(ModuleApi.getAuthToken(unexpectedValue));
  });
});

describe('ModuleApi.saveMenu and ModuleApi.getMenu', function () {
  it('getMenu should return an function, after a menu is saved.', function () {
    var unexpectedValue = 'abc';
    assert.isNull(ModuleApi.getMenu());
    setUpMenus();
    assert.isObject(ModuleApi.getMenu('testMenu'));
    assert.isArray(ModuleApi.getMenu('testMenu').menu);
    assert.isString(ModuleApi.getMenu('testMenu').menu[0]);
    assert.isFunction(ModuleApi.getMenu(unexpectedValue));
  });
});

describe('ModuleApi.getGatewayLanguageAndSaveInCheckStore', function () {
  it('getGatewayLanguageAndSaveInCheckStore should put a gateway language in the checkstore.', function (done) {
    this.timeout(50000);
    var params = {
      bookAbbr: '3jn'
    };
    function progressCallback() { };
    assert.isUndefined(ModuleApi.getDataFromCommon('gatewayLanguage'));
    ModuleApi.getGatewayLanguageAndSaveInCheckStore(params, progressCallback, function (data) {
      assert.isObject(data);
      assert.isArray(data.chapters);
      assert.isObject(ModuleApi.getDataFromCommon('gatewayLanguage'));
      done();
    });
  });
});

describe('ModuleApi Event Listeners', function () {
  var sampleCallback = function (sampleParam) {
    assert.equal(sampleParam, 'Success');
  }
  var SUCCESS = 'Success';
  var FAIL = 'Fail';
  it('registerEventListener create a listener with a callback', function (done) {
    ModuleApi.registerEventListener('sampleEvent', sampleCallback);
    ModuleApi.emitEvent('sampleEvent', SUCCESS);
    done()
  });
  it('removeEventListener release the listner from the callback', function (done) {
    ModuleApi.removeEventListener('sampleEvent', sampleCallback);
    ModuleApi.emitEvent('sampleEvent', FAIL);
    done();
  });
});

describe('ModuleApi.getLoggedInUser', function () {
  it('should return an object of the current user', function (done) {
    const CoreActions = require('../src/js/actions/CoreActions.js');
    CoreActions.login({ full_name: "Jay Scott", username: "royalsix" });
    assert.deepEqual(ModuleApi.getLoggedInUser(), { fullName: "Jay Scott", userName: "royalsix" });
    done();
  });
});

describe('ModuleApi.createAlert', function () {
  it('should display an alert on screen and handle callback', function (done) {
    ModuleApi.createAlert({}, (response) => {
      assert.equal(response, 'Success');
      done();
    });
    const CoreActions = require('../src/js/actions/CoreActions.js');
    CoreActions.sendAlertResponse('Success');
  });
});

describe('ModuleApi Checkstore Functions', function () {
  var CheckStore = require('../src/js/stores/CheckStore.js');
  const sampleWord = 'ORANGE';
  it('putDataInCheckStore should put data in the checkstore', function (done) {
    ModuleApi.putDataInCheckStore('translationRhymes', 'rhymeWord', sampleWord);
    var word = CheckStore.getModuleDataObject('translationRhymes').rhymeWord;
    assert.equal(word, sampleWord);
    done();
  });
  it('getDataFromCheckStore should get data from the checkstore -_-', function (done) {
    var word = ModuleApi.getDataFromCheckStore('translationRhymes', 'rhymeWord');
    assert.equal(word, sampleWord);
    done();
  });
});

describe('ModuleApi.saveProject', function () {
  it('should be able to return error is not a git repository', function (done) {
    ModuleApi.putDataInCommon('saveLocation', './')
    ModuleApi.saveProject('I Love Tc', function(err){
      assert.isNotNull(err);
      done();
    });
  });
});

describe('ModuleApi Settings Functions', function () {
  const sampleSetting = 'AI MODE';
  const sampleValue = 'ACTIVATED';
  it('setSettings should set the specified setting', function (done) {
    ModuleApi.setSettings(sampleSetting, sampleValue);
    var value = localStorage.getItem('settings');
    assert.equal([sampleSetting][value], sampleValue);
    done();
  });
  it('getSettings should get the specified setting', function (done) {
    var value = ModuleApi.getSettings(sampleSetting);
    assert.equal(value, sampleValue);
    done();
  });
});