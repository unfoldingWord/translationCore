const CoreStore = require('../../.././stores/CoreStore.js');
const CoreActions = require('../../.././actions/CoreActions');
const CheckStore = require('../../.././stores/CheckStore');
const fs = require(window.__base + 'node_modules/fs-extra');
const api = window.ModuleApi;
const Books = require('../BooksOfBible');
const Path = require('path');
const ManifestGenerator = require('./ProjectManifest');
const git = require('../GitApi.js');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled');

var CheckDataGrabber = {
  doneModules: 0,
  totalModules: 0,
  reportViews: [],

  /**
   * @description - This calls helper methods to call each fetch data function within the
   * array of modules given to this method through the parameters
   * @param {array} modulePaths - Array of arrays, each sub array contains two elements:
   * the first being the name of the module and the second being the path to the module
   * @param {object} params - This is an object containing params that was gotten from CheckStore
   * and is passed to the FetchDatas
   */
  fetchModules: function (checkArray, callback) {
    try {
      var params = api.getDataFromCommon('params');
      this.doneModules = 0;
      this.saveModules(checkArray, (err, checksThatNeedToBeFetched) => {
        if (!err) {
          if (checksThatNeedToBeFetched.length < 1) {
            CoreActions.doneLoadingFetchData();
          }
          for (let moduleObj of checksThatNeedToBeFetched) {
            this.getDataFromOnline(moduleObj.name, moduleObj.location, params);
          }
          api.putDataInCommon('arrayOfChecks', checkArray);
          callback(null, true);
        } else {
          this.dataLoadError(error);
          callback(error, false);
        }
      });
    }
    catch (error) {
      this.dataLoadError(error);
      callback(error, false);
    }

  },


  saveModules: function (checkArray, callback) {
    let checksThatNeedToBeFetched = [];
    try {
      for (let module of checkArray) {
        let viewObj = require(Path.join(module.location, 'View'));
        api.saveModule(module.name, viewObj.view);
        if (module.location && !CheckStore.hasData(module.name)) {
          checksThatNeedToBeFetched.push(module);
        }
        CoreStore.updateNumberOfFetchDatas(checksThatNeedToBeFetched.length);
        this.totalModules = checksThatNeedToBeFetched.length;
      }
      callback(null, checksThatNeedToBeFetched);
    } catch (e) {
      callback(e, null);
    }
  },


  /**
   * @description - Loads in a module and dependencies depending on the dependencies found in
   * the manifest file within the main module folder. Doesn't load a module if it is already
   * found in the CheckStore
   * @param {string} moduleFolderPath - the name of the folder the module and manifest file for
   * that module is located in
   */
  loadModuleAndDependencies: function (moduleFolderName, callback) {
    CoreActions.startLoading();
    var _this = this;
    var modulePath = Path.join(moduleFolderName, 'package.json');
    fs.readJson(modulePath, (error, dataObject) => {
      if (!error) {
        CoreStore.setCurrentCheckCategory(dataObject.name);
        _this.saveModuleMenu(dataObject, moduleFolderName);
        _this.createCheckArray(dataObject, moduleFolderName, (err, checkArray) => {
          if (!err) {
            _this.fetchModules(checkArray, callback);
          }
          else {
            callback(err, false);
          }
        });
      }
      else {
        callback(error, false);
      }
    });
  },


  createCheckArray: function (dataObject, moduleFolderName, callback) {
    var modulePaths = [];
    try {
      if (!dataObject.name || !dataObject.version || !dataObject.title || !dataObject.main) {
        callback("Bad package.json for tool", null);
      } else {
        modulePaths.push({ name: dataObject.name, location: moduleFolderName });
        for (let childFolderName in dataObject.include) {
          //If a developer hasn't defined their module in the corret way, this'll probably throw an error
          if (Array.isArray(dataObject.include)) {
            modulePaths.push({
              name: dataObject.include[childFolderName],
              location: Path.join(PACKAGE_COMPILE_LOCATION, dataObject.include[childFolderName])
            });
          } else {
            modulePaths.push({
              name: childFolderName,
              location: Path.join(PACKAGE_COMPILE_LOCATION, childFolderName)
            });
          }
        }
        callback(null, modulePaths);
      }
    } catch (e) {
      this.dataLoadError(e);
      callback(e, null);
    }
  },

  saveModuleMenu: function (dataObject, moduleFolderName) {
    try {
      api.saveMenu(dataObject.name, require(Path.join(moduleFolderName, 'MenuView.js')));
    }
    catch (e) {
      if (e.code != "MODULE_NOT_FOUND") {
        console.error(e);
      }
    }
  },

  /**
   * @description - This is called whenever each FetchData finishes. See {@link getDataFromCheck}.
   * @param {string || null} - An potential error string if one happened, null if it didn't
   * @param {object} data - optional parameter that FetchData's can return. TODO: Not sure
   * if still needed
   */
  onComplete: function (err, data) {
    this.doneModules++;
    if (!err) {
      if (this.doneModules >= this.totalModules) {
        //update stuff
        var path = api.getDataFromCommon('saveLocation');
        if (path) {
          git(path).init(function () {
            git(path).save('Initial TC Commit', path, function () {
              CoreActions.doneLoadingFetchData();
            });
          });
        }
        else {
          var Alert = {
            title: "Warning",
            content: "Save location is not defined",
            leftButtonText: "Ok"
          }
          api.createAlert(Alert);
        }
      }
    }
    else {
      console.error(err);
    }
  },

  /**
   * @description - This sends a CoreAction that in turn updates the progress bar according
   * to the name and progress of a single FetchData see {@link getDataFromCheck}
   * @param {string} name - The name or 'namespace' of the module's FetchData that is updating
   * their progress
   * @param {integer} data - the quantifiable number of how far done a FetchData has fetched their
   * appropriate data. Should be from 0-100, but no error checking to make it sure
   */
  Progress: function (name, data) {
    CoreActions.sendProgressForKey({ progress: data, key: name });
    if (data == 100) {
      console.log(name + " finished loading.");
    }
  },

  /**
   * @description - This function tests to see if a module is a 'main' module as opposed to a
   * 'tool'. Main modules define the layout for nearly the entire page while tools are what
   * supplment the main module in that layout and are enclosed in the main module
   * @param {string} folderpath - absolute file path to the enclosing module's folder
   */
  isMainModule: function (filepath) {
    try {
      var stats = fs.lstatSync(filepath);
      if (!stats.isDirectory()) {
        return false;
      }
      try {
        fs.accessSync(Path.join(filepath, 'ReportView.js'));
        return true;
      } catch (e) {
        return false;
      }
    }
    catch (e) {
      return false;
    }
  },

  /**
   * @description - This loads a single FetchData
   * @param {string} path - This is a relative path to the enclosing module's folder
   * @param {object} params - Object that gets passed to FetchData's, contains necessary
   * params for the FetchData's to load their data
   */
  getDataFromOnline: function (name, path, params) {
    var DataFetcher = require(Path.join(path, 'FetchData'));
    //call the FetchData function
    var _this = this;
    DataFetcher(
      params,
      function (data) {
        _this.Progress(name, data);
      },
      this.onComplete.bind(this)
    );
  },

  dataLoadError: function (content) {
    const alert = {
      title: 'Error Loading TC',
      content: content,
      leftButtonText: 'Ok'
    }
    console.log(content);
  }
};

module.exports = CheckDataGrabber;
