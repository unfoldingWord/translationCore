const CoreStore = require('../../.././stores/CoreStore');
const CoreActions = require('../../.././actions/CoreActions');
const CheckStore = require('../../.././stores/CheckStore');
const fs = require(window.__base + 'node_modules/fs-extra');
const api = window.ModuleApi;
const Books = require('../BooksOfBible');
const Path = require('path');
const ManifestGenerator = require('./ProjectManifest');
const git = require('../GitApi.js');

const REQUIRE_ERROR = "Unable to require file";

var indexOfModule = 0;
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
  fetchModules: function(modulePaths, params) {
    var checkArray = [];
    let checksThatNeedToBeFetched = [];
    this.doneModules = 0;
    for (let moduleObj of modulePaths) {
      checkArray.push(moduleObj);
      this.saveModule(moduleObj.location);
      if (moduleObj.location && !CheckStore.hasData(moduleObj.name)) {
        checksThatNeedToBeFetched.push(moduleObj);
      }
    }
    if (checksThatNeedToBeFetched.length > 0) {
      CoreStore.updateNumberOfFetchDatas(checksThatNeedToBeFetched.length);
      this.totalModules = checksThatNeedToBeFetched.length;
      for (let moduleObj of checksThatNeedToBeFetched) {
        try {
          this.getDataFromCheck(moduleObj.name, moduleObj.location, params);
        }
        catch(error) {
          const alert = {
            title: 'Unable to load and run FetchData from module',
            content: error.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
          console.error(error);
        }
      }
    }
    else {
      CoreActions.doneLoadingFetchData();
    }
    api.putDataInCommon('arrayOfChecks', checkArray);
  },



  /**
   * @description - Loads in a module and dependencies depending on the dependencies found in
   * the manifest file within the main module folder. Doesn't load a module if it is already
   * found in the CheckStore
   * @param {string} moduleFolderPath - the name of the folder the module and manifest file for
   * that module is located in
   */
  loadModuleAndDependencies: function(moduleFolderName) {
    var _this = this;
    var moduleBasePath = Path.join(window.__base, 'modules');
    var modulePath = Path.join(moduleFolderName, 'manifest.json');
    fs.readJson(modulePath, function(error, dataObject) {
      if (error) {
        console.error(error);
      }
      else {
        var params = api.getDataFromCommon('params');
        var modulePaths = [];
        modulePaths.push({name: dataObject.name, location: moduleFolderName});
        //Try to find and save the menu. Most modules don't
        try {
          api.saveMenu(dataObject.name, require(Path.join(moduleFolderName, 'MenuView.js')));
        }
        catch (e) {
          if (e.code != "MODULE_NOT_FOUND") {
            console.error(e);
          }
        }


        CoreStore.setCurrentCheckCategory(dataObject.name);
        for (let childFolderName of dataObject.include) {
          //If a developer hasn't defined their module in the corret way, this'll probably throw an error
          try {
            modulePaths.push({name: _this.getModuleNameFromFolderPath(Path.join(moduleBasePath, childFolderName)),
              location: Path.join(moduleBasePath, childFolderName)});
          }
          catch (e) {
            const alert = {
            title: 'Error Loading Module',
            content: 'Check Module Format',
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
            console.error(e);
          }
        }
        _this.fetchModules(modulePaths, params);
      }
    });
  },

  /**
   * @description - This returns the name of the module as defined by the View.js in the path
   * @param {string} path - This is the folderpath that points to the location of the modules
   * main folder. This must be an absolute path
   */
  getModuleNameFromFolderPath: function(folderPath) {
    try {
      fs.accessSync(Path.join(folderPath, 'manifest.json'));
      return fs.readJsonSync(Path.join(folderPath, 'manifest.json')).name;
    }
    catch(e) {
      try {
        fs.accessSync(Path.join(folderPath, 'View.js'));
        return require(Path.join(folderPath, 'View.js')).name;
      }
      catch(error) {
        const alert = {
            title: 'Error Loading Module',
            content: error.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
        console.error(e);
        console.error(error);
      }
    }
    return null;
  },

  /**
   * @description - This is called whenever each FetchData finishes. See {@link getDataFromCheck}.
   * @param {string || null} - An potential error string if one happened, null if it didn't
   * @param {object} data - optional parameter that FetchData's can return. TODO: Not sure
   * if still needed
   */
  onComplete: function(err, data) {
    this.doneModules++;
    if (!err) {
      if (this.doneModules >= this.totalModules) {
        //update stuff
        var path = api.getDataFromCommon('saveLocation');
        if (path) {
          git(path).init(function() {
            git(path).save('Initial TC Commit', path, function() {
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
        CoreActions.doneLoadingFetchData();
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
  Progress: function(name, data) {
    CoreActions.sendProgressForKey({progress: data, key: name});
  },

  /**
   * @description - This function tests to see if a module is a 'main' module as opposed to a
   * 'tool'. Main modules define the layout for nearly the entire page while tools are what
   * supplment the main module in that layout and are enclosed in the main module
   * @param {string} folderpath - absolute file path to the enclosing module's folder
   */
  isMainModule:function(filepath) {
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

  saveModule: function(path) {
    let viewObj = require(Path.join(path, 'View'));

    //save the view associated with the module so that modules may be able to reference them later
    api.saveModule(viewObj.name, viewObj.view);
    //Save their report view if they have it
    if (this.isMainModule(path)) {
      this.reportViews.push(viewObj);
    }
  },

  /**
   * @description - This loads a single FetchData
   * @param {string} path - This is a relative path to the enclosing module's folder
   * @param {object} params - Object that gets passed to FetchData's, contains necessary
   * params for the FetchData's to load their data
   */
  getDataFromCheck: function(name, path, params) {
    var DataFetcher = require(Path.join(path, 'FetchData'));

    //call the FetchData function
    var _this = this;
    DataFetcher(
      params,
      function(data) {
        _this.Progress(name, data);
      },
      this.onComplete.bind(this)
    );
  }
};

  module.exports = CheckDataGrabber;
