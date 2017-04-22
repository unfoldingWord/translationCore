/**
 * @author Logan Lebanoff, Sam Faulkner
 * @description The CheckStore. Loads data from disk, holds data, handles events, and saves data back to disk.
 * Data is compartmentalized into namespaces. Each module should have exclusive accesss to its own namesapce.
 * The 'common' namespace should contain data that will be used by multiple modules.
 * Events are registered by Components in their 'componentWillMount' functions.
 * Events are used by components if they need to communicate to another component to update that component's view.
 ******************************************************************************/

const EventEmitter = require('events').EventEmitter;
const Dispatcher = require('../dispatchers/Dispatcher');
const fs = require(window.__base + 'node_modules/fs-extra');
const utils = require("../utils.js");
const pathModule = require('path');

class CheckStore extends EventEmitter {
  constructor() {
    super();
    this.storeData = {};
  }

  /**
  * @description - This will put in the CheckStore. Under the CheckStore's object the params
  * will be like so:
  * this.data = {
  *   field = {
  *     key = value;
  *   }
  * }
  * @param {string} field - The main field that the key and value will be saved under in
  * the CheckStore's object
  * @param {string} key - The key that the value will be 'saved' in the field's object
  * @param {anything} value - thing that is assigned to the key
  */
  putInData(field, key, value) {
    if (!(field in this.storeData)) {
      this.storeData[field] = {};
    }
    this.storeData[field][key] = value;
    if ('common' in this.storeData) {
    }
  }

  /**
  * @description - See {@link putInData} but puts it in a common field that is accessible by
  * any module
  */
  putInCommon(key, value) {
    this.putInData('common', key, value);
  }

  // This needs to return immutable data
  getModuleDataObject(field) {
    if (!field) {
      return this.storeData.common;
    }

    if (field in this.storeData) {
      return this.storeData[field];
    }

    return null;
  }

  /**
  * @description - Returns the object behind the 'common' key within the CheckStore's storeData
  */
  getCommonDataObject() {
    return this.storeData.common;
  }

  /**
  * @description - Returns a single value associated from a key within the common field in the
  * CheckStore's data
  * @param {string} key - the key that will you want to get the value from the common field
  */
  getFromCommon(key) {
    if (this.storeData['common']) {
      return this.storeData.common[key];
    }

    return null;
  }

  /**
  * @description - Retrieves the object behind the given field within CheckStore's data
  * object and saves to the path
  * @param {string} field - string that denotes which field to save to the disk from the data
  * @param {string} path - the path to save the json file to
  */
  saveDataToDisk(field, path, callback=() => {}) {
    if (this.storeData[field]) {
      var projectSaveLocation = pathModule.join(path, 'checkdata', field + '.tc');
      fs.outputJson(projectSaveLocation, this.storeData[field], callback);
    }
  }

  saveAllToDisk(path, callback=() => {}) {
    var _this = this;
    function iterateOver(list, iterator, callback) {
      var doneCount = 0;

      function report(error) {
        if (error) {
          callback(error);
        }
        else {
          doneCount++;
          if (doneCount == list.length) {
            callback();
          }
        }
      }

      for (var i = 0; i < list.length; i++) {
        iterator(list[i], report);
      }
    }
    var fieldList = [];
    for (var field in this.storeData) {
      fieldList.push(field);
    }

    iterateOver(fieldList, function(field, callbackReport) {
      _this.saveDataToDisk(field, path, callbackReport);
    }, callback);
  }

  saveStoreToDisk(path, callback=()=>{}) {
    fs.outputJson(this.storeData, path, callback);
  }

  /**
  * @description - Retrieves a json object from disk and loads it in under CheckStore's
  * data under the field specified
  * @param {string} field - the field the loaded data will be saved under in CheckStore's data
  * @param {string} path - the path the json will be loaded from
  * @param {function} callback - optional callback parameter to be called on a successful load
  * of the file
  */
  loadDataFromDisk(field, path, callback=() => {}) {
    fs.readJson(path, function(error, data) {
      //Temporary error checking
      if (error) {
        console.error(error)
      }
      else {
        this.storeData.field = data;
        callback();
      }
    });
  }

  /**
  * @description - Removes the field object from the CheckStore's data
  * @param {string} field - string denoting the field to remove
  */
  removeDataFromCheckStore(field) {
    if (this.storeData.field) this.storeData.field = undefined;
  }

  /**
  * @description - This adds a callback associated with an event that will be called when
  * the event is emitted
  * @param {string} eventType - string denoting the type of event
  * @param {function} callback - callback that will be called when an event is emitted
  * with a single 'params' parameter that could be undefined
  */
  addEventListener(eventType, callback) {
    this.on(eventType, callback);
  }

  /**
  * @description - Removes the callback from the event type
  * @param {string} eventType - the event type the callback is associated with
  * @param {function} callback - the function to remove from the specified event
  */
  removeEventListener(eventType, callback) {
    this.removeListener(eventType, callback);
  }

  /**
  * @description - Emits and event and passes the given params
  * @param {string} event - string that specifies the type of event to emit
  * @param {object} params - an object that carries the params to an event listener
  */
  emitEvent(event, params) {
    this.emit(event, params);
  }

  WIPE_ALL_DATA() {
    //THIS SHOULD NOT BE USED EXCEPT ON CREATE AND NEW PROJECT
    this.storeData = {};
    this.storeData['common'] = {};
  }

  /**
   * @description - This returns a boolean if the parameters exist within the checkstore
   * @param {string} namespace - The namespace to check under, or if the second parameter
   * doesn't exist, check this parameter by itself
   * @param {string} key - optional, if supplied will check if this key is defined under
   * the given namespace
   */
  hasData(namespace, key) {
    if (this.storeData[namespace]) {
      if (!key) {
        return true;
      }
      else {
        return !(this.storeData[namespace][key] === null ||
          this.storeData[namespace][key] === undefined);
      }
    }
    return false;
  }
}

const checkStore = new CheckStore;
module.exports = checkStore;
