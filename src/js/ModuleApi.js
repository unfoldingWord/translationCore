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

    createAlert(obj, callback = () => {}) {
        Alert.startListener(callback);
        CoreActions.sendAlert({
            alertObj:obj,
            alertCallback: callback
        });
    }
    
    /**
     * Asynchronously fetches the gateway language from Door43, puts it in the check store,
     * and calls the callback parameter.
     * If this is the only asynchronous part of your FetchData function, then pass in
     * the callback from your FetchData as the 'callback' parameter to this function.
     * Otherwise, wait until all subfunctions of FetchData are complete before calling
     * the callback.
     */
    putGatewayLanguageInCheckStore(params, progressCallback, callback) {
        var Door43Fetcher = new Door43DataFetcher();
        Door43Fetcher.getBook(
            params.bookAbbr,
            function(done, total) {
                progressCallback((done / total) * 50);
            },
            function(error, data) {
                if (error) {
                    console.error('Door43Fetcher throwing error');
                    callback(error);
                }
                else {
                    var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
                    var bookData;
                    if (!gatewayLanguage) {
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
                        callback();
                    }
                }
            }
        );
    }
    
    initializeCheckStore(nameSpace, params, groups) {
        this.putDataInCheckStore(nameSpace, 'groups', groups);
        this.putDataInCheckStore(nameSpace, 'currentCheckIndex', 0);
        this.putDataInCheckStore(nameSpace, 'currentGroupIndex', 0);
        this.putDataInCheckStore(nameSpace, 'book', this.convertToFullBookName(params.bookAbbr));
    }
}

const api = new ModuleApi();
module.exports = api;
