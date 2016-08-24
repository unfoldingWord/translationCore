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
const Dispatcher = require('./dispatchers/Dispatcher.js');
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

  getMenu(namespace) {
    if (!namespace) {
      return null;
    }
    if (!this.menus) {
      this.menus = {};
    }
    if (!this.menus[namespace]) {
      var menuCreatorFunction = require('./components/core/navigation_menu/MenuView.js');
      var menu = menuCreatorFunction(namespace);
      this.menus[namespace] = menu;
    }
    return this.menus[namespace];
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

  getDataFromCheckStore(field, key=null) {
    var obj = CheckStore.getModuleDataObject(field);
    if (obj != null && typeof obj == "object") {
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

  outputJson(path, data, callback=(error)=>{if (error) console.error(error);}) {
    fs.outputJson(path, data, callback);
  }

  inputText(path, callback) {
    fs.readFile(path, callback);
  }

  outputText(path, string, callback) {
    fs.writeFile(path, string, callback);
  }

  convertToFullBookName(bookAbbr) {
    return BooksOfBible[bookAbbr];
  }

/**
  * @description - Takes in a full book name or book abbreviation and returns the abbreviation.
  * ex. convertToBookAbbreviation('2 Timothy') => '2ti'
  * @param {string} fullBookName - A book name or abbreviation. In the case of abbreviation the
  * abbreviation will just be returned
*/
  convertToBookAbbreviation(fullBookName) {
    for (var key in BooksOfBible) {
      if (BooksOfBible[key].toLowerCase() == fullBookName.toLowerCase() ||
      fullBookName.toLowerCase() == key) {
        return key;
      }
    }
  }

  logCheckStore() {
    console.log(CheckStore.storeData);
  }

  createAlert(obj, callback = () => {}) {
    Alert.startListener(callback);
    CoreActions.sendAlert({
      alertObj:obj,
      alertCallback: callback
    });
  }

/**
  * Asynchronously fetches the gateway language book from Door43, puts it in the check store,
  * and calls the callback function with the gateway language book as an argument.
  *
  * The book that is saved to the check store has the chapters and verses formatted
  * as key-value pairs. This format is used by the TPane, which sorts the keys in its render
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
    this.putDataInCheckStore(nameSpace, 'groups', groups);
    this.putDataInCheckStore(nameSpace, 'currentCheckIndex', 0);
    this.putDataInCheckStore(nameSpace, 'currentGroupIndex', 0);
    this.putDataInCheckStore(nameSpace, 'book', this.convertToFullBookName(params.bookAbbr));
  }

  getLoggedInUser(){
    let user = CoreStore.getLoggedInUser();
    if(!user){
      return undefined;
    }
    let fullName = user.full_name;
    let userName = user.username;
    return {fullName, userName};
  }

  clearAlertCallback() {
    CoreStore.alertObj = null;
  }
  /**
  * @description - Displays alert and returns user response
  */
  createAlert(obj, callback = () => {}) {
    Alert.startListener(callback);
    CoreActions.sendAlert({
      alertObj:obj,
      alertCallback: callback
    });
  }

  updateManifest(field, data, callback = () => {}) {
    var manifest = this.getDataFromCommon('tcManifest');
    var saveLocation = this.getDataFromCommon('saveLocation');
    if (manifest && saveLocation) {
      manifest[field] = data;
      saveLocation += '/tc-manifest.json';
      fs.outputJson(saveLocation, manifest, callback);
    } else {
      callback("No manifest found")
    }
  }

  saveProject(message) {
    var _this = this;
    var git = require('./components/core/GitApi.js');
    var path = this.getDataFromCommon('saveLocation');
    if (path) {
      git(path).save(message, path, function() {
      });
    } else {
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
}

const api = new ModuleApi();
module.exports = api;
