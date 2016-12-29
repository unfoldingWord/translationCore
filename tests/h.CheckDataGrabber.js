const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const CheckDataGrabber = require('../src/js/components/core/create_project/CheckDataGrabber.js');
const CheckStore = require('../src/js/stores/CheckStore.js');
const CoreStore = require('../src/js/stores/CoreStore.js');
const path = require('path-extra');
const api = window.ModuleApi;
const fs = require(window.__base + 'node_modules/fs-extra');

const PARENT = path.datadir('translationCore');
const PACKAGE_SAVE_LOCATION = path.join(PARENT, 'packages-compiled');
const testTool = path.join(PACKAGE_SAVE_LOCATION, 'ExampleChecker');
const testCheckArray = [
    {
        "name": "ExampleChecker",
        "location": path.join(PACKAGE_SAVE_LOCATION , "ExampleChecker")
    },
    {
        "name": "TPane",
        "location": path.join(PACKAGE_SAVE_LOCATION , "TPane")
    },
    {
        "name": "ExampleTool",
        "location": path.join(PACKAGE_SAVE_LOCATION , "ExampleTool")
    },
    {
        "name": "CommentBox",
        "location": path.join(PACKAGE_SAVE_LOCATION , "CommentBox")
    }
];

const testCheckArrayBadPath = [
    {
        "name": "ExampleChecker",
        "location": path.join(PACKAGE_SAVE_LOCATION , "ExampleChecker")
    },
    {
        "name": "TPane",
        "location": path.join(PACKAGE_SAVE_LOCATION , "TPane")
    },
    {
        "name": "ExampleTool",
        "location": path.join(PACKAGE_SAVE_LOCATION , "ExampleTool")
    },
    {
        "name": "CommentBox",
        "location": path.join(PACKAGE_SAVE_LOCATION , "HiliarysEmails")
    }
];

const testDataObject = {
    "name": "ExampleChecker",
    "title": "Example Check",
    "version": "1.0.0",
    "description": "This is an example check app for reference for developers.",
    "main": "View.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "display": "app",
    "repository": {
        "type": "git"
    },
    "include": [
        "TPane",
        "ExampleTool",
        "CommentBox"
    ],
    "dependencies": {
        "babel-preset-react": "^6.16.0"
    }
};

const testDataObjectBadPackageJSON = {
    "name": "ExampleChecker",
    "version": "1.0.0",
    "description": "This is an example check app for reference for developers.",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "display": "app",
    "repository": {
        "type": "git"
    },
    "include": [
        "TPane",
        "ExampleTool",
        "CommentBox"
    ],
    "dependencies": {
        "babel-preset-react": "^6.16.0"
    }
};

describe('CheckDataGrabber.saveModules', function () {
    it('should fetch the data given a valid check array', function (done) {
        CheckDataGrabber.saveModules(testCheckArray, function (err, checksThatNeedToBeFetched) {
            assert.isNull(err);
            assert.isArray(checksThatNeedToBeFetched);
            done();
        });
    });
});

describe('CheckDataGrabber.fetchModules', function () {
    it('should fail on a bad path of a checking tool sub modules', function (done) {
        CheckDataGrabber.fetchModules(testCheckArrayBadPath, function (err, success) {
            assert.isNotNull(err);
            assert.isFalse(success);
            assert.isTrue(CoreStore.doneLoading);
            done();
        });
    });
    it('should fetch the data given a valid check array', function (done) {
        CheckDataGrabber.fetchModules(testCheckArray, function (err, success) {
            assert.isNull(err);
            assert.isTrue(success);
            done();
        });
    });
});

describe('CheckDataGrabber.loadModuleAndDependencies', function () {
    it('should load a tool', function (done) {
        CheckDataGrabber.loadModuleAndDependencies(testTool, (err, success) => {
            assert.isNull(err);
            assert.isTrue(success);
            assert.isObject(api.getDataFromCommon('params'));
            expect(api.getDataFromCommon('arrayOfChecks')).to.exist;
            expect(api.modules['ExampleChecker']).to.exist;
            done();
        });
    });
});

describe('CheckDataGrabber.createCheckArray', function () {
    it('should not create a check array from a bad data object', function (done) {
        CheckDataGrabber.createCheckArray(testDataObjectBadPackageJSON, testTool, (err, checkArray) => {
            assert.isNotNull(err);
            assert.isNull(checkArray);
            done();
        });
    });
    it('should create a check array from a sample data object', function (done) {
        CheckDataGrabber.createCheckArray(testDataObject, testTool, (err, checkArray) => {
            assert.isNull(err);
            assert.isArray(checkArray);
            assert.deepEqual(checkArray, testCheckArray);
            done();
        });
    });
});