//ModuleApi.js//

//node modules
const fs = require(window.__base + 'node_modules/fs-extra');

//user imports
const Alert = require('./components/core/Alert.js')
const CheckStore = require('./stores/CheckStore.js');
const CoreStore = require('./stores/CoreStore.js');
const CoreActions = require('./actions/CoreActions.js');
const Dispatcher = require('./dispatchers/Dispatcher.js');

const React = require('react');
const ReactBootstrap = require('react-bootstrap');
const ReactDOM = require('react-dom');

const BooksOfBible = require('./components/core/BooksOfBible');

const MENU_WARN = 'Attempting to save another menu over namespace: ';

class ModuleApi {
  constructor() {
        this.React = React;
        this.ReactBootstrap = ReactBootstrap;
        this.modules = {};
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
        if (this.menus) {
            return this.menus[namespace];
        }
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

    logCheckStore() {
        console.log(CheckStore.storeData);
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


    createAlert(obj, callback = () => {}) {
        Alert.startListener(callback);
        CoreActions.sendAlert({
                alertObj:obj,
                alertCallback: callback
            });
    }
}

const api = new ModuleApi();
module.exports = api;
