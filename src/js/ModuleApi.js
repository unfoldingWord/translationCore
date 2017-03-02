//ModuleApi.js//

const React = require('react');
const ReactBootstrap = require('react-bootstrap');
const ReactDOM = require('react-dom');

//node modules
const fs = require(window.__base + 'node_modules/fs-extra');

//user imports
const Alert = require('./components/core/Alert.js')
const CheckStore = require('./stores/CheckStore.js');
const CoreStore = require('./stores/CoreStore.js');
const CoreActions = require('./actions/CoreActions.js');
const Door43DataFetcher = require('./components/core/parsers/Door43DataFetcher.js');
const BooksOfBible = require('./components/core/BooksOfBible');
const CheckModule = require('./components/core/CheckModule');
const MENU_WARN = 'Attempting to save another menu over namespace: ';

class ModuleApi {
  constructor() {
    this.React = React;
    this.ReactBootstrap = ReactBootstrap;
    this.CheckModule = CheckModule;
    this.modules = {};
    this.Popover = require('./components/core/PopoverApi');
    this.Toast = require('./NotificationApi/ToastApi');
    this.Git = require('./components/core/GitApi.js');
    this.ReportFiltersTools = require('./components/core/reports/ReportFilters.js');
    this.ReportFilters = this.ReportFiltersTools.filter;
    this.gitStack = [];
    this.gitDone = true;
    this.currentGroupName = this.initialCurrentGroupName();
    this.currentToolMetaData = null;
  }

  findDOMNode(component) {
    return ReactDOM.findDOMNode(component);
  }

  saveMenu(namespace, menu) {
    if (!this.menus) {
      this.menus = {};
    }
    if (namespace in this.menus) {
      console.warn(MENU_WARN + namespace);
    }
    this.menus[namespace] = menu;
  }


  saveModule(identifier, module) {
    this.modules[identifier] = module;
  }

  getModule(identifier) {
    if (identifier in this.modules) {
      return this.modules[identifier];
    }
    return null;
  }

  registerEventListener(eventType, callback) {
    CheckStore.addEventListener(eventType, callback);
  }

  removeEventListener(eventType, callback) {
    CheckStore.removeEventListener(eventType, callback);
  }

  emitEvent(event, params) {
    CheckStore.emitEvent(event, params);
  }

  getDataFromCheckStore(field, key = null) {
    if (key == 'staticSettings') {
    }
    var obj = CheckStore.getModuleDataObject(field);
    if (obj && typeof obj == "object") {
      if (key) {
        return obj[key];
      }
      return obj;
    }
    return null;
  }

  getDataFromCommon(key) {
    var commonDataObject = CheckStore.getCommonDataObject();
    if (commonDataObject != null && typeof commonDataObject == "object") {
      if (key) {
        return commonDataObject[key];
      }
      return commonDataObject;
    }
    return null;
  }

  putDataInCheckStore(field, key, value) {
    CheckStore.putInData(field, key, value);
  }

  putDataInCommon(key, value) {
    CheckStore.putInCommon(key, value);
  }

  inputJson(path, callback) {
    fs.readJson(path, callback);
  }

  outputJson(path, data, callback = (error) => { if (error) console.error(error); }) {
    fs.outputJson(path, data, callback);
  }

  inputText(path, callback) {
    fs.readFile(path, callback);
  }

  outputText(path, string, callback) {
    fs.writeFile(path, string, callback);
  }

  convertToFullBookName(bookAbbr) {
    if (!bookAbbr) return;
    return BooksOfBible[bookAbbr.toString().toLowerCase()];
  }

  /**
    * @description - Takes in a full book name or book abbreviation and returns the abbreviation.
    * ex. convertToBookAbbreviation('2 Timothy') => '2ti'
    * @param {string} fullBookName - A book name or abbreviation. In the case of abbreviation the
    * abbreviation will just be returned
  */
  convertToBookAbbreviation(fullBookName) {
    if (!fullBookName) return;
    for (var key in BooksOfBible) {
      if (BooksOfBible[key].toString().toLowerCase() == fullBookName.toString().toLowerCase() ||
        fullBookName.toString().toLowerCase() == key) {
        return key;
      }
    }
  }

  logCheckStore() {
    return CheckStore.storeData;
  }

  /**
    * Asynchronously fetches the gateway language book from Door43, puts it in the check store,
    * and calls the callback function with the gateway language book as an argument.
    *
    * The book that is saved to the check store has the chapters and verses formatted
    * as key-value pairs. This format is used by the ScripturePane, which sorts the keys in its render
    * method. This is bad and should be refactored to format the chapters and verses as arrays.
    *
    * The book that is passed as an argument to the callback has the chapters and verses
    * formatted as arrays.
  */
  getGatewayLanguageAndSaveInCheckStore(params, progressCallback, callback) {
    var Door43Fetcher = new Door43DataFetcher();
    Door43Fetcher.getBook(params.bookAbbr, function (done, total) {
      progressCallback((done / total) * 50);
    }, function (error, data) {
      if (error) {
        console.error('Door43Fetcher throwing error');
      }
      else {
        var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
        var bookData;
        /*
        * we found the gatewayLanguage already loaded, now we must convert it
        * to the format needed by the parsers
        */
        if (gatewayLanguage) {
          var reformattedBookData = { chapters: [] };
          for (var chapter in gatewayLanguage) {
            var chapterObject = {
              verses: [],
              num: parseInt(chapter)
            }
            for (var verse in gatewayLanguage[chapter]) {
              var verseObject = {
                num: parseInt(verse),
                text: gatewayLanguage[chapter][verse]
              }
              chapterObject.verses.push(verseObject);
            }
            chapterObject.verses.sort(function (first, second) {
              return first.num - second.num;
            });
            reformattedBookData.chapters.push(chapterObject);
          }
          reformattedBookData.chapters.sort(function (first, second) {
            return first.num - second.num;
          });
          callback(reformattedBookData);
        }
        // We need to load the data, and then reformat it for the store and store it
        else {
          bookData = Door43Fetcher.getULBFromBook(data);
          //reformat
          var newBookData = {};
          for (var chapter of bookData.chapters) {
            newBookData[chapter.num] = {};
            for (var verse of chapter.verses) {
              newBookData[chapter.num][verse.num] = verse.text;
            }
          }
          newBookData.title = api.convertToFullBookName(params.bookAbbr);
          //load it into checkstore
          api.putDataInCommon('gatewayLanguage', newBookData);
          //resume fetchData
          for (var chapter of bookData.chapters) {
            chapter.verses.sort(function (first, second) {
              return first.num - second.num;
            });
          }
          bookData.chapters.sort(function (first, second) {
            return first.num - second.num;
          });
          callback(bookData);
        }
      }
    });
  }

  initializeCheckStore(nameSpace, params, groups) {
    if (!nameSpace || !params || !groups) {
      return 'Missing one or more parameters'
    }
    this.putDataInCheckStore(nameSpace, 'groups', groups);
    this.putDataInCheckStore(nameSpace, 'currentCheckIndex', 0);
    this.putDataInCheckStore(nameSpace, 'currentGroupIndex', 0);
    this.putDataInCheckStore(nameSpace, 'book', this.convertToFullBookName(params.bookAbbr));
  }

  getLoggedInUser() {
    let user = CoreStore.getLoggedInUser();
    if (!user) {
      return undefined;
    }
    let fullName = user.full_name;
    let userName = user.username;
    return { fullName, userName };
  }

  clearAlertCallback() {
    CoreStore.alertObj = null;
  }
  /**
  * @description - Displays alert and returns user response
  */
  createAlert(obj, callback = () => { }) {
    Alert.startListener(callback);
    CoreActions.sendAlert({
      alertObj: obj,
      alertCallback: callback
    });
  }

  updateManifest(field, data, callback = () => { }) {
    var manifest = this.getDataFromCommon('tcManifest');
    var saveLocation = this.getDataFromCommon('saveLocation');
    if (manifest && saveLocation) {
      manifest[field] = data;
      saveLocation += '/tc-manifest.json';
      this.putDataInCommon('tcManifest', manifest);
      fs.outputJson(saveLocation, manifest, callback);
    } else if (!manifest) {
      callback("No manifest found");
    } else {
      manifest[field] = data;
      this.putDataInCommon('tcManifest', manifest);
      callback("No save location specified");
    }
  }

  saveProject(message, callback) {
    var _this = this;
    _this.gitCallback = callback;
    var git = require('./components/core/GitApi.js');
    var path = this.getDataFromCommon('saveLocation');
    if (path && this.gitDone) {
      _this.gitDone = false;
      git(path).save(message, path, function (err) {
        _this.gitDone = true;
        if (_this.gitStack.length > 0) {
          _this.saveProject(_this.gitStack.shift());
        }
        if (callback) callback(err);
      });
    }
    else {
      this.gitStack.push(message);
    }
    if (!path) {
      var Alert = {
        title: "Warning",
        content: "Save location is not defined",
        leftButtonText: "Ok"
      }
      this.createAlert(Alert);
    }
  }

  getAuthToken(type) {
    if (this.authToken == undefined) {
      var obj = fs.readJsonSync(window.__base + 'Auth.json', { throws: false })
      if (obj) {
        this.authToken = obj;
        return obj[type];
      }
      else {
        var Alert = {
          title: "Authentication Error",
          content: "Please check token.",
          leftButtonText: "Ok"
        }
        this.createAlert(Alert);
      }
    }
    else {
      return this.authToken[type];
    }
  }

  getSettings(name) {
    var settings = localStorage.getItem('settings');
    if (settings) {
      var settingsObj = JSON.parse(settings);
      if (!name) {
        return settingsObj;
      }
      return settingsObj[name];
    }
    return {};
  }

  setSettings(name, value) {
    var settings = localStorage.getItem('settings');
    var settingsObj = settings ? JSON.parse(settings) : {};
    settingsObj[name] = value;
    var settingsString = JSON.stringify(settingsObj);
    localStorage.setItem('settings', settingsString);
  }

  putToolMetaDatasInStore(metadatas) {
    this.currentToolMetaData = metadatas;
  }

  getToolMetaDataFromStore() {
    return this.currentToolMetaData;
  }

  setCurrentGroupName(groupName) {
    this.currentGroupName = groupName;
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    if (!currentNamespace) return;
    let groups = this.getDataFromCheckStore(currentNamespace, 'groups');
    let foundGroup = groups.find(arrayElement => arrayElement.group === this.currentGroupName);
    let groupIndex = groups.indexOf(foundGroup);
    this.putDataInCheckStore(currentNamespace, 'currentCheckIndex', 0);
    this.putDataInCheckStore(currentNamespace, 'currentGroupIndex', groupIndex);
    this.emitEvent('changeGroupName',
      {
        "groupName": groupName
      });
  }

  getCurrentGroupName() {
    return this.currentGroupName;
  }

  initialCurrentGroupName() {
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let currentGroupIndex = this.getDataFromCheckStore(currentNamespace, 'currentGroupIndex');
    let foundGroup = [];
    if (currentNamespace && currentGroupIndex && currentGroupIndex >= 0) {
      foundGroup = this.getDataFromCheckStore(currentNamespace, 'groups')[currentGroupIndex];
    }
    this.currentGroupName = foundGroup.group;
  }

  getSubMenuItems() {
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    if (!currentNamespace) return 'No namespace';
    let groups = this.getDataFromCheckStore(currentNamespace, 'groups');
    let foundGroup = [];
    if (this.currentGroupName) {
      if (groups) {
        foundGroup = groups.find(arrayElement => arrayElement.group === this.currentGroupName);
      }
    }
    return foundGroup.checks;
  }

  getCurrentGroupIndex() {
    let groupIndex = null;
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let groups = this.getDataFromCheckStore(currentNamespace, 'groups');
    if (groups) {
      let foundGroup = groups.find(arrayElement => arrayElement.group === this.currentGroupName);
      groupIndex = groups.indexOf(foundGroup);
    }
    return groupIndex;
  }

  changeCurrentIndexes(checkIndex) {
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    if (!currentNamespace) return 'No namespace';
    let groups = this.getDataFromCheckStore(currentNamespace, 'groups');
    let foundGroup = groups.find(arrayElement => arrayElement.group === this.currentGroupName);
    let groupIndex = groups.indexOf(foundGroup);
    checkIndex = parseInt(checkIndex);
    this.putDataInCheckStore(currentNamespace, 'currentCheckIndex', checkIndex);
    this.putDataInCheckStore(currentNamespace, 'currentGroupIndex', groupIndex);
    this.emitEvent('goToCheck',
      {
        'groupIndex': groupIndex,
        'checkIndex': checkIndex
      }
    );
  }

  //this method returns the Current Check Namespace
  getCurrentCheckNamespace() {
    return CoreStore.getCurrentCheckNamespace();
  }

}

const api = new ModuleApi();
module.exports = api;
