import fs from 'fs-extra';
import consts from './CoreActionConsts';
import Path from 'path-extra';
import git from '../components/core/login/GogsApi.js';
import CoreActionsRedux from './CoreActionsRedux';
import LoaderActions from './LoaderActions';
import AlertModalActions from './AlertModalActions';
import {clearPreviousData} from '../components/core/UploadMethods.js';
const api = window.ModuleApi;
const PACKAGE_SUBMODULE_LOCATION = Path.join(window.__base, 'tC_apps');
console.log(LoaderActions);
export const fetchModules = function(checkArray, currentCheckNamespace) {
  try {
    fs.ensureDirSync(api.getDataFromCommon('saveLocation'));
    // TODO factor out call
    var params = api.getDataFromCommon('params');
    this.saveModules(checkArray, (err, checksThatNeedToBeFetched, totalModules) => {
      if (!err) {
        if (checksThatNeedToBeFetched.length < 1) {
          dispatch({
            type: consts.DONE_LOADING,
            doneLoading: true,
            currentCheckNamespace: currentCheckNamespace
          });
          dispatch(CoreActionsRedux.setToolNamespace(currentCheckNamespace));
        }
        dispatch(LoaderActions.toggleLoader(true));
        for (let moduleObj of checksThatNeedToBeFetched) {
          this.getDataFromOnline(moduleObj.name, moduleObj.location, params, currentCheckNamespace, totalModules);
        }
        api.putDataInCommon('arrayOfChecks', checkArray);
      } else {
        dispatch(this.errorLoadingProject(err));
      }
    });
  } catch (error) {
    dispatch(this.errorLoadingProject(error));
  }
};

export const saveModules = function(checkArray, callback) {
  let checksThatNeedToBeFetched = [];
  try {
    for (let module of checkArray) {
      try {
        var viewObj = require(Path.join(module.location, 'Container'));
        var container = true;
      } catch (err) {
        try {
          var viewObj = require(Path.join(module.location, 'View'));
          var container = false;
        } catch (err) {
          console.error(err);
        }
      } finally {
        dispatch(LoaderActions.saveModule(module.name, viewObj.view || viewObj.container));
        api.saveModule(module.name, viewObj.view || viewObj.container);
      }
      if (module.location && !CheckStore.hasData(module.name)) {
        checksThatNeedToBeFetched.push(module);
      }
      dispatch(LoaderActions.updateNumberOfFetchDatas(checksThatNeedToBeFetched.length));
      var totalModules = checksThatNeedToBeFetched.length;
    }
    callback(null, checksThatNeedToBeFetched, totalModules);
  } catch (e) {
    callback(e, null);
  }
};

/**
* @description - Loads in a module and dependencies depending on the dependencies found in
* the manifest file within the main module folder. Doesn't load a module if it is already
* found in the CheckStore
* @param {string} moduleFolderName - the name of the folder the module and manifest file for
* that module is located in
*/
export const loadModuleAndDependencies = function(moduleFolderName) {
  return ((dispatch) => {
    dispatch({type: consts.START_LOADING});
    var _this = this;
    var modulePath = Path.join(moduleFolderName, 'package.json');
    fs.readJson(modulePath, (error, dataObject) => {
      if (!error) {
        _this.saveModuleMenu(dataObject, moduleFolderName);
        _this.createCheckArray(dataObject, moduleFolderName, (err, checkArray) => {
          if (!err) {
            _this.fetchModules(checkArray, dataObject.name);
          } else {
            dispatch(this.errorLoadingProject(err));
          }
        });
      } else {
        dispatch(this.errorLoadingProject(error));
      }
    });
  });
};

export const createCheckArray = function(dataObject, moduleFolderName, callback) {
  var modulePaths = [];
  try {
    if (!dataObject.name || !dataObject.version || !dataObject.title || !dataObject.main) {
      callback("Bad package.json for tool", null);
    } else {
      modulePaths.push({name: dataObject.name, location: moduleFolderName});
      for (let childFolderName in dataObject.include) {
        //If a developer hasn't defined their module in the corret way, this'll probably throw an error
        if (Array.isArray(dataObject.include)) {
          modulePaths.push({
            name: dataObject.include[childFolderName],
            location: Path.join(PACKAGE_SUBMODULE_LOCATION, dataObject.include[childFolderName])
          });
        } else {
          modulePaths.push({
            name: childFolderName,
            location: Path.join(PACKAGE_SUBMODULE_LOCATION, childFolderName)
          });
        }
      }
      callback(null, modulePaths);
    }
  } catch (e) {
    console.error(e);
    callback(e, null);
  }
};

export const saveModuleMenu = function(dataObject, moduleFolderName) {
  try {
    api.saveMenu(dataObject.name, require(Path.join(moduleFolderName, 'MenuView.js')));
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") {
      console.error(e);
    }
  }
};

/**
* @description - This is called whenever each FetchData finishes. See {@link getDataFromCheck}.
* @param {String} err - An potential error string if one happened, null if it didn't
* @param {object} data - optional parameter that FetchData's can return. TODO: Not sure
* if still needed
*/
export const onComplete = function(currentCheckNamespace, totalModules, err, data) {
  return ((dispatch, getState) => {
    dispatch({type: consts.DONE_MODULES});
    if (!err) {
      const doneModules = getState().coreStoreReducer.doneModules;
      if (doneModules >= totalModules) {
        //update stuff
        var path = api.getDataFromCommon('saveLocation');
        if (path) {
          var newError = console.error;
          console.error = console.errorold;
          git(path).init(function(err) {
            if (!err) {
              git(path).save('Initial TC Commit', path, function(err) {
                dispatch({
                  type: consts.DONE_LOADING,
                  doneLoading: true,
                  currentCheckNamespace: currentCheckNamespace
                });
                dispatch(CoreActionsRedux.setToolNamespace(currentCheckNamespace));
                console.error = newError;
              });
            } else {
              CoreActionsRedux.killLoading();
              api.createAlert({
                title: 'Error Saving Data To Project',
                content: 'There was an error with saving project data.',
                moreInfo: err,
                leftButtonText: "Ok"
              });
              console.error = newError;
            }
          });
        } else {
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
  });
}

/**
* @description - This functiontests to see if a module is a 'main' module as opposed to a
* 'tool'. Main modules define the layout for nearly the entire page while tools are what
* supplment the main module in that layout and are enclosed in the main module
* @param {string} folderpath - absolute file path to the enclosing module's folder
*/
export const isMainModule = function(filepath) {
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
  } catch (e) {
    return false;
  }
};

/**
* @description - This loads a single FetchData
* @param {string} path - This is a relative path to the enclosing module's folder
* @param {object} params - Object that gets passed to FetchData's, contains necessary
* params for the FetchData's to load their data
*/
export const getDataFromOnline = function(name, path, params, currentCheckNamespace, progressFunc, totalModules) {
  var DataFetcher = require(Path.join(path, 'FetchData'));
  //call the FetchData function
  DataFetcher(
    params,
    (data) => progressFunc(data, name),
    this.onComplete.bind(this, currentCheckNamespace, totalModules)
  );
};

export const errorLoadingProject = function(err) {
  return ((dispatch) => {
    dispatch({type: consts.DONE_LOADING});
    const alertMessage = {
      title: "Problem Loading Your Project",
      content: err.message,
      leftButtonText: "Ok",
      moreInfo: err,
      visibility: true
    };
    dispatch(AlertModalActions.showAlert(alertMessage));
    clearPreviousData();
  });
};
