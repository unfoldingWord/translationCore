/**
  * @description Testing for the ModuleApi.
  * @author: Ian Hoegen and Jay Scott
  *****************************************************************************/
const chai = require('chai');
const assert = chai.assert;
require('../src/js/pages/index');
const ModuleApi = require('../src/js/ModuleApi.js');
const CoreActions = require('../src/js/actions/CoreActions.js');
var testObj = {test: 'abcd'};
var testNumber = 42;
var unexpectedValue = 'abc';

function addDataToCommon() {
  ModuleApi.putDataInCommon('testString', 'This is a test string');
  ModuleApi.putDataInCommon('testObject', { id: 'Test object' });
  ModuleApi.putDataInCommon('testNumber', 42);
}

function setUpMenus() {
  var sampleMenu = { menu: ["1", "2"] };
  ModuleApi.saveMenu('testMenu', sampleMenu);
}

describe('ModuleApi.constructor', function() {
  it('constructor should set instance variables correctly', function() {
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

describe('ModuleApi.convertToFullBookName', function() {
  it('convertToFullBookName should return the full book name based on abbreviation', function() {
    var mrk = 'mrk';
    var mrkUpper = 'MRK';
    var mrkExpected = 'Mark';
    assert.equal(ModuleApi.convertToFullBookName(mrk), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(mrkUpper), mrkExpected);
  });
  it('convertToFullBookName should return undefiled for an invalid abbreviation', function() {
    assert.isUndefined(ModuleApi.convertToFullBookName(unexpectedValue));
  });
  it('convertToFullBookName should still work with non-string values', function() {
    assert.isUndefined(ModuleApi.convertToFullBookName(testObj));
    assert.isUndefined(ModuleApi.convertToFullBookName(testNumber));
    assert.isUndefined(ModuleApi.convertToFullBookName(null));
  });
});

describe('ModuleApi.convertToBookAbbreviation', function() {
  it('convertToBookAbbreviation should return the book abbreviation based on full name', function() {
    var mark = 'Mark';
    var markUpper = 'MARK';
    var markExpected = 'mrk';
    assert.equal(ModuleApi.convertToBookAbbreviation(mark), markExpected);
    assert.equal(ModuleApi.convertToBookAbbreviation(markUpper), markExpected);
  });
  it('convertToBookAbbreviation should return undefined for an invalid book.', function() {
    assert.isUndefined(ModuleApi.convertToBookAbbreviation(unexpectedValue));
  });
  it('convertToBookAbbreviation should still work with non-string values', function() {
    assert.isUndefined(ModuleApi.convertToBookAbbreviation(testObj));
    assert.isUndefined(ModuleApi.convertToBookAbbreviation(testNumber));
    assert.isUndefined(ModuleApi.convertToBookAbbreviation(null));
  });
});

describe('ModuleApi.putDataInCommon and ModuleApi.getDataFromCommon', function() {
  it('putDataInCommon should add data to common', function() {
    try {
      addDataToCommon();
      assert.equal(true, true);
    } catch (err){
      assert.equal(err, false);
    }
  });
  it('getDataFromCommon should return data that was from putDataInCommon', function() {
    var expectedString = 'This is a test string';
    var expectedObject = 'Test object';
    var expectedNumber = 42;
    assert.equal(ModuleApi.getDataFromCommon('testString'), expectedString);
    assert.isString(ModuleApi.getDataFromCommon('testString'));
    assert.equal(ModuleApi.getDataFromCommon('testObject').id, expectedObject);
    assert.isObject(ModuleApi.getDataFromCommon('testObject'));
    assert.equal(ModuleApi.getDataFromCommon('testNumber'), expectedNumber);
    assert.isNumber(ModuleApi.getDataFromCommon('testNumber'));
  });
  it('getDataFromCommon should return undefined for data that is not in common', function() {
    assert.isUndefined(ModuleApi.getDataFromCommon(unexpectedValue));
  });
  it('getDataFromCommon should not fail when queried with non-string keys', function() {
    assert.isUndefined(ModuleApi.getDataFromCommon(testObj));
    assert.isUndefined(ModuleApi.getDataFromCommon(testNumber));
    assert.isObject(ModuleApi.getDataFromCommon(null));
  });
});

describe('ModuleApi.initializeCheckStore', function() {
  it('initializeCheckStore should return an error if parameters are undefined', function() {
    assert.equal(ModuleApi.initializeCheckStore(), 'Missing one or more parameters');
  });
  it('initializeCheckStore should initialize a CheckStore with default values', function() {
    var params = {
      bookAbbr: 'mrk'
    };
    var nameSpace = 'tests';
    var groups = [{group: 'test group'}];
    ModuleApi.initializeCheckStore(nameSpace, params, groups);
    assert.equal(ModuleApi.getDataFromCheckStore(nameSpace, 'currentCheckIndex'), 0);
    assert.isUndefined(ModuleApi.getDataFromCheckStore(nameSpace, 'invalidData'));
    assert.isArray(ModuleApi.getDataFromCheckStore(nameSpace, 'groups'));
    assert.equal(ModuleApi.getDataFromCheckStore(nameSpace, 'book'), 'Mark');
  });
});

describe('ModuleApi.logCheckStore', function() {
  it('logCheckStore should return the entire CheckStore.', function() {
    var loggedCheckStore = ModuleApi.logCheckStore();
    assert.isObject(loggedCheckStore);
    assert.isObject(loggedCheckStore.common);
    assert.isObject(loggedCheckStore.tests)
  });
});

describe('ModuleApi.updateManifest', function() {
  it('updateManifest should tell us if no manifest is found', function() {
    ModuleApi.updateManifest('type', 'test', function(data) {
      assert.equal(data, 'No manifest found');
    });
  });
  it('updateManifest should update the manifest if one is initialized', function() {
    ModuleApi.putDataInCommon('tcManifest', {name: 'tcManifest', type: 'project'});
    ModuleApi.updateManifest('type', 'test', function(data) {
      assert.equal(data, 'No save location specified');
      assert.equal(ModuleApi.getDataFromCommon('tcManifest').type, 'test');
      assert.equal(ModuleApi.getDataFromCommon('tcManifest').name, 'tcManifest');
    });
  });
  it('updateManifest should not fail with undefined values', function() {
    ModuleApi.updateManifest(undefined, null, function(data) {
      assert.equal(data, 'No save location specified');
      assert.isNull(ModuleApi.getDataFromCommon('tcManifest').undefined);
    });
  });
  it('updateManifest should update the manifest and write it to a file with a saveLocation present', function(done) {
    ModuleApi.putDataInCommon('saveLocation', './tests/testIO/');
    ModuleApi.putDataInCommon('tcManifest', {name: 'tcManifest', type: 'project'});
    ModuleApi.updateManifest('type', 'test', function(err) {
      if (err) {
        assert.equal(true, false);
      }
      assert.equal(ModuleApi.getDataFromCommon('tcManifest').type, 'test');
      assert.equal(ModuleApi.getDataFromCommon('tcManifest').name, 'tcManifest');
      done();
    });
  });
});

describe('ModuleApi.inputJson and ModuleApi.outputJson', function() {
  var sampleObject = {
    name: 'translationCore',
    purpose: 'testObject',
    id: 'IOtests'
  };
  it('outputJson should be able to write a json object to a file', function(done){
    ModuleApi.outputJson('./tests/testIO/test.json', sampleObject, function(err) {
      if (err) {
        assert.equal(true, false);
      } else {
        assert.equal(true, true);
      }
      done();
    });
  });
  it('outputJson should fail with a non string file path', function(done) {
    try {
      ModuleApi.outputJson(null, sampleObject, function(err) {
        assert.equal(true, false);
        done();
      });
    } catch(err) {
      assert.equal(true, true);
      done();
    }
  });
  it('outputJson should fail with a non object', function(done) {
    try {
      ModuleApi.outputJson(null, testString, function(err) {
        assert.equal(true, false);
        done();
      });
    } catch(err) {
      assert.equal(true, true);
      done();
    }
  });
  it('inputJson should be able to read a json manifest from a file', function(done){
    ModuleApi.inputJson('./tests/testIO/tc-manifest.json', function(err, data) {
      if (err || !data) {
        assert.equal(true, false);
      } else {
        assert.isObject(data);
        assert.equal(data.type, 'test');
        assert.equal(data.name, 'tcManifest');
      }
      done();
    });
  });
  it('inputJson should be able to read a json object from a file', function(done){
    ModuleApi.inputJson('./tests/testIO/test.json', function(err, data) {
      if (err || !data) {
        assert.equal(true, false);
      } else {
        assert.isObject(data);
        assert.equal(data.name, sampleObject.name);
        assert.isString(data.name);
      }
      done();
    });
  });
  it('inputJson should fail with a non string file path', function(done) {
    try {
      ModuleApi.outputJson(null, function(err) {
        assert.equal(true, false);
        done();
      });
    } catch(err) {
      assert.equal(true, true);
      done();
    }
  });
});

describe('ModuleApi.inputText and ModuleApi.outputText', function() {
  var sampleText = "Hello world, I am translationCore";
  it('outputText should be able to write a json object to a file', function(done){
    ModuleApi.outputText('./tests/testIO/test.txt', sampleText, function(err) {
      if (err) {
        assert.equal(true, false);
      } else {
        assert.equal(true, true);
      }
      done();
    });
  });
  it('outputText should fail with a non string file path', function(done) {
    try {
      ModuleApi.outputText(null, sampleText, function(err) {
        assert.equal(true, false);
        done();
      });
    } catch(err) {
      assert.equal(true, true);
      done();
    }
  });
  it('inputText should be able to read from a file', function(done){
    ModuleApi.inputText('./tests/testIO/test.txt', function(err, data) {
      if (err || !data) {
        assert.equal(true, false);
      } else {
        assert.equal(data, sampleText);
        assert.isString(data.toString());
      }
      done();
    });
  });
  it('inputText should fail with a non string file path', function(done) {
    try {
      ModuleApi.inputText(null, function(err) {
        assert.equal(true, false);
        done();
      });
    } catch(err) {
      assert.equal(true, true);
      done();
    }
  });
});

describe('ModuleApi.getAuthToken', function() {
  it('getAuthToken should return undefined for a non existent token', function() {
    var unexpectedValue = 'abc';
    assert.isUndefined(ModuleApi.getAuthToken(unexpectedValue));
  });
  it('getAuthToken should return an auth token, of type string', function() {
    assert.isString(ModuleApi.getAuthToken('git'));
    assert.isString(ModuleApi.getAuthToken('gogs'));
  });
});

describe('ModuleApi.saveMenu and ModuleApi.getMenu', function() {
  it('saveMenu should not fail with undefined values.', function() {
    try {
      ModuleApi.saveMenu(undefined, undefined);
      assert.equal(true, true);
    } catch (err){
      console.log(err);
      assert.equal(true, false);
    }
  });
  it('saveMenu should setup a menu without any issue', function() {
    try {
      setUpMenus();
      assert.equal(true, true);
    } catch (err){
      console.log(err);
      assert.equal(true, false);
    }
  });

  it('getMenu should return an function, after a menu is saved', function() {
    var unexpectedValue = 'abc';
    assert.isObject(ModuleApi.getMenu('testMenu'));
    assert.isString(ModuleApi.getMenu('testMenu').menu[0]);
    assert.isArray(ModuleApi.getMenu('testMenu').menu);
  });
  it('getMenu should return null if no menu is specified', function() {
    assert.isNull(ModuleApi.getMenu());
  });
  it('getMenu should return a funciton if the menu does not exist', function() {
    assert.isFunction(ModuleApi.getMenu(unexpectedValue));
  })
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
  it('registerEventListener should fail if there is no callback', function(done) {
    try {
      ModuleApi.registerEventListener('anotherEvent');
      ModuleApi.emitEvent('anotherEvent', SUCCESS);
      assert.isTrue(false);
    } catch(err) {
      assert.isTrue(true);
    }
    done();
  });
  it('removeEventListener release the listner from the callback', function (done) {
    ModuleApi.removeEventListener('sampleEvent', sampleCallback);
    ModuleApi.emitEvent('sampleEvent', FAIL);
    done();
  });
});

describe('ModuleApi.getLoggedInUser', function () {
  it('getLoggedInUser should return undefined if no user is logged in', function() {
    assert.isUndefined(ModuleApi.getLoggedInUser());
  });
  it('getLoggedInUser should return an object of the current user', function (done) {
    CoreActions.login({ full_name: "Jay Scott", username: "royalsix" });
    assert.deepEqual(ModuleApi.getLoggedInUser(), { fullName: "Jay Scott", userName: "royalsix" });
    done();
  });
});

describe('ModuleApi.createAlert', function () {
  it('createAlert should not crash if no parameters are specified', function() {
    try {
      ModuleApi.createAlert();
      CoreActions.sendAlertResponse('fail');
      assert.isTrue(true);
    } catch (err) {
      assert.equal(false, err);
    }
  });
  it('createAlert should display an alert on screen and handle callback', function (done) {
    ModuleApi.createAlert({}, (response) => {
      assert.equal(response, 'Success');
      done();
    });
    CoreActions.sendAlertResponse('Success');
  });
});

describe('ModuleApi Checkstore Functions', function () {
  var CheckStore = require('../src/js/stores/CheckStore.js');
  const sampleWord = 'ORANGE';
  it('putDataInCheckStore should not fail putting undefined data in the checkstore', function() {
    try {
      ModuleApi.putDataInCheckStore();
      assert.isTrue(true);
    } catch (err) {
      assert.equal(false, err);
    }
  });
  it('putDataInCheckStore should put data in the checkstore', function (done) {
    ModuleApi.putDataInCheckStore('translationRhymes', 'rhymeWord', sampleWord);
    var word = CheckStore.getModuleDataObject('translationRhymes').rhymeWord;
    assert.equal(word, sampleWord);
    done();
  });
  it('getDataFromCheckStore should return null for invalid data', function() {
    assert.isNull(ModuleApi.getDataFromCheckStore('abcd'));
  });
  it('getDataFromCheckStore should return the entire checkstore if there is no parameters', function() {
    assert.isObject(ModuleApi.getDataFromCheckStore());
  });
  it('getDataFromCheckStore should get data from the checkstore -_-', function (done) {
    var word = ModuleApi.getDataFromCheckStore('translationRhymes', 'rhymeWord');
    assert.equal(word, sampleWord);
    done();
  });
});

describe('ModuleApi Settings Functions', function () {
  const sampleSetting = 'AI MODE';
  const sampleValue = 'ACTIVATED';
  it('setSettings should set the specified setting', function (done) {
    ModuleApi.setSettings(sampleSetting, sampleValue);
    var value = localStorage.getItem('settings');
    assert.equal(JSON.parse(value)[sampleSetting], sampleValue);
    done();
  });
  it('setSettings should not fail if undefined data is passed', function() {
    try {
      ModuleApi.setSettings()
      assert.isTrue(true);
    } catch (err) {
      assert.equal(false, err);
    }
  });
  it('getSettings should return undefined for a setting that does not exist', function() {
    assert.isUndefined(ModuleApi.getSettings());
    assert.isUndefined(ModuleApi.getSettings(unexpectedValue));
  });
  it('getSettings should get the specified setting', function (done) {
    var value = ModuleApi.getSettings(sampleSetting);
    assert.equal(value, sampleValue);
    done();
  });
});

describe('ModuleApi.putToolMetaDatasInStore and ModuleApi.getToolMetaDataFromStore', function() {
  it('putToolMetaDatasInStore should fail with undefined tool metadata', function() {
    try {
      ModuleApi.putToolMetaDatasInStore();
      assert.isTrue(false);
    } catch(err) {
      assert.equal(true, true);
    }
  });
  it('getToolMetaDataFromStore should return undefined if no data is saved', function() {
    assert.isUndefined(ModuleApi.getToolMetaDataFromStore());
  });
  it('putToolMetaDatasInStore should add metadata to the store', function() {
    try {
      ModuleApi.putToolMetaDatasInStore('Test metadata');
      assert.equal(true, true);
    } catch(err) {
      assert.equal(false, err);
    }
  });
  it('getToolMetaDataFromStore should retrieve metadata from the store', function() {
    try {
      var metadata = ModuleApi.getToolMetaDataFromStore();
      assert.equal(metadata, 'Test metadata');
      assert.isString(metadata);
    } catch(err) {
      assert.equal(false, err);
    }
  });
});

describe('ModuleApi.setCurrentGroupName and ModuleApi.getCurrentGroupName', function() {
  it('setCurrentGroupName should not fail when values are undefined', function() {
    try {
      ModuleApi.setCurrentGroupName();
      assert.equal(true, true);
    } catch(err) {
      assert.equal(false, err);
    }
  });
  it('getCurrentGroupName should return undefined if no currentGroupName is set', function() {
    try {
      var metadata = ModuleApi.getCurrentGroupName();
      assert.isUndefined(metadata)
    } catch(err) {
      assert.equal(false, err);
    }
  });
  it('setCurrentGroupName should change the name of the current group', function() {
    try {
      ModuleApi.setCurrentGroupName('Test Group Name');
      assert.equal(true, true);
    } catch(err) {
      assert.equal(false, err);
    }
  });
  it('getCurrentGroupName should retrieve the name of the current group from the store', function() {
    try {
      var metadata = ModuleApi.getCurrentGroupName();
      assert.equal(metadata, 'Test Group Name');
      assert.isString(metadata);
    } catch(err) {
      assert.equal(false, err);
    }
  });
});

describe('ModuleApi.getSubMenuItems', function() {
  it('ModuleApi.getSubMenuItems should retrieve the submenu items', function(){
    var submenu = ModuleApi.getSubMenuItems();
    assert.isString(submenu);
    assert.equal('No namespace', submenu);
  });
});

describe('ModuleApi.getCurrentGroupIndex', function() {
  it('ModuleApi.getCurrentGroupIndex should retrieve the current group index', function(){
    var index = ModuleApi.getCurrentGroupIndex();
    assert.isNull(index);
  });
});

describe('ModuleApi.changeCurrentIndexes', function() {
  it('ModuleApi.changeCurrentIndexes should change the current group index', function(){
    var index = ModuleApi.changeCurrentIndexes(42);
    assert.isString(index);
    assert.equal('No namespace', index);
  });
});
/**
 * LEAVE OUT UNTIL SOLUTION FOR AUTH.JSON IS REACHED
describe('ModuleApi.getGatewayLanguageAndSaveInCheckStore', function() {
  it('getGatewayLanguageAndSaveInCheckStore should put a gateway language in the checkstore', function(done) {
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
*/
