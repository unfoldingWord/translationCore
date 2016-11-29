/**
  * @description Testing for the ModuleApi.
  * @author: Ian Hoegen and Jay Scott
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
    var unexpectedValue = 'abc';
    assert.equal(ModuleApi.convertToFullBookName(mrk), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(mrkUpper), mrkExpected);
    assert.isUndefined(ModuleApi.convertToFullBookName(unexpectedValue));
  });
});

describe('ModuleApi.convertToBookAbbreviation', function() {
  it('convertToBookAbbreviation should return the book abbreviation based on full name', function() {
    var mark = 'Mark';
    var markUpper = 'MARK';
    var markExpected = 'mrk';
    var unexpectedValue = 'abcd';
    assert.equal(ModuleApi.convertToBookAbbreviation(mark), markExpected);
    assert.equal(ModuleApi.convertToBookAbbreviation(markUpper), markExpected);
    assert.isUndefined(ModuleApi.convertToBookAbbreviation(unexpectedValue));
  });
});

describe('ModuleApi.putDataInCommon and ModuleApi.getDataFromCommon', function() {
  it('putDataInCommon should add data to common', function() {
    try {
      addDataToCommon();
      assert.equal(true, true);
    } catch (err){
      assert.equal(true, false);
    }
  });

  it('getDataFromCommon should return data that was from putDataInCommon', function() {
    var expectedString = 'This is a test string';
    var expectedObject = 'Test object';
    var expectedNumber = 42;
    var unexpectedValue = 'abc';
    assert.equal(ModuleApi.getDataFromCommon('testString'), expectedString);
    assert.isString(ModuleApi.getDataFromCommon('testString'));
    assert.equal(ModuleApi.getDataFromCommon('testObject').id, expectedObject);
    assert.isObject(ModuleApi.getDataFromCommon('testObject'));
    assert.equal(ModuleApi.getDataFromCommon('testNumber'), expectedNumber);
    assert.isNumber(ModuleApi.getDataFromCommon('testNumber'));
    assert.isUndefined(ModuleApi.getDataFromCommon(unexpectedValue));
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
});

describe('ModuleApi.initializeCheckStore', function() {
  it('initializeCheckStore should initaze a CheckStore with default values', function() {
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
  it('updateManifest should update the manifest', function() {
    ModuleApi.updateManifest('type', 'test', function(data) {
      assert.equal(data, 'No manifest found');
    });
    ModuleApi.putDataInCommon('tcManifest', {name: 'tcManifest', type: 'project'});
    ModuleApi.updateManifest('type', 'test', function(data) {
      assert.equal(data, 'No save location specified');
      assert.equal(ModuleApi.getDataFromCommon('tcManifest').type, 'test');
      assert.equal(ModuleApi.getDataFromCommon('tcManifest').name, 'tcManifest');
    });
  });
  it('updateManifest should update the manifest and write it to a file', function(done) {
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
});
//
// describe('ModuleApi.getAuthToken', function() {
//   it('getAuthToken should return an auth token, of type string', function() {
//     var unexpectedValue = 'abc';
//     assert.isString(ModuleApi.getAuthToken('git'));
//     assert.isString(ModuleApi.getAuthToken('gogs'));
//     assert.isUndefined(ModuleApi.getAuthToken(unexpectedValue));
//   });
// });

describe('ModuleApi.saveMenu and ModuleApi.getMenu', function() {
  it('saveMenu should setup a menu without any issue', function() {
    try {
      setUpMenus();
      assert.equal(true, true);
    } catch (err){
      assert.equal(true, false);
    }
  });

  it('getMenu should return an function, after a menu is saved', function() {
    var unexpectedValue = 'abc';
    assert.isNull(ModuleApi.getMenu());
    assert.isObject(ModuleApi.getMenu('testMenu'));
    assert.isArray(ModuleApi.getMenu('testMenu').menu);
    assert.isString(ModuleApi.getMenu('testMenu').menu[0]);
    assert.isFunction(ModuleApi.getMenu(unexpectedValue));
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

describe('ModuleApi Settings Functions', function () {
  const sampleSetting = 'AI MODE';
  const sampleValue = 'ACTIVATED';
  it('setSettings should set the specified setting', function (done) {
    ModuleApi.setSettings(sampleSetting, sampleValue);
    var value = localStorage.getItem('settings');
    assert.equal(JSON.parse(value)[sampleSetting], sampleValue);
    done();
  });
  it('getSettings should get the specified setting', function (done) {
    var value = ModuleApi.getSettings(sampleSetting);
    assert.equal(value, sampleValue);
    done();
  });
});

describe('ModuleApi.putToolMetaDatasInStore and ModuleApi.getToolMetaDataFromStore', function() {
  it('ModuleApi.putToolMetaDatasInStore should add metadata to the store', function() {
    try {
      ModuleApi.putToolMetaDatasInStore('Test metadata');
      assert.equal(true, true);
    } catch(err) {
      assert.equal(false, err);
    }
  });
  it('ModuleApi.getToolMetaDataFromStore should retrieve metadata from the store', function() {
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
  it('ModuleApi.setCurrentGroupName should change the name of the current group', function() {
    try {
      ModuleApi.setCurrentGroupName('Test Group Name');
      assert.equal(true, true);
    } catch(err) {
      assert.equal(false, err);
    }
  });
  it('ModuleApi.getCurrentGroupName should retrieve the name of the current group from the store', function() {
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
describe('ModuleApi.saveProject', function () {
  it('should be able to return error is not a git repository', function (done) {
    ModuleApi.putDataInCommon('saveLocation', './tests/testIO/');
    ModuleApi.saveProject('I Love Tc', function(err){
      assert.isNotNull(err);
      done();
    });
  });
});
