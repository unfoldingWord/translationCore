//ModuleApi.js//

//node modules
const React = require('react');

//user imports
const CheckStore = require('./stores/CheckStore.js');
const Dispatcher = require('./dispatchers/Dispatcher.js');


class ModuleApi {
	constructor() {
        this.ReactComponent = React.Component;
	}

    sendAction(type) {
        Dispatcher.handleAction(type);
    }

    registerAction(type, callback) {
        CheckStore.registerAction(type, callback);
    }

    removeAction(type, callback) {
        CheckStore.removeAction(type, callback);
    }

    registerEventListener() {
        CheckStore.addEventListener(eventType, callback);
    }

    removeEventListener() {
        CheckStore.removeEventListener(eventType, callback);
    }

    emitEvent(event, params) {
        CheckStore.emitEvent(event, params);
    }

    getDataFromCheckStore(field) {
        /* return a copy of the data from the check store so that even
         * if an evil developer tries to mutate the store directly it won't mutate
         */
        var obj = CheckStore.getModuleDataObject(field);
        return Object.assign({}, obj);
    }

    getDataFromCommon(key) {
        /* return a copy of the data from check store rather than the data
         * itself so it can't be mutated directly
         */
        var commonObj = CheckStore.getFromCommon(key);
        return Object.assign({}, commonObj);
    }

    putDataInCheckStore(field, key, value) {
        CheckStore.putInData(field, key, value);
    }

    putDataInCommon(key, value) {
        CheckStore.putInCommon(key, value);
    }
}

module.exports = ModuleApi;
