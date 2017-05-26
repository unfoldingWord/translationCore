global.path = require('path-extra');
global.fs = require('fs-extra');
const chai = require('chai');
const assert = chai.assert;
const expect = require('chai').expect;
import React from 'react';
import {mount, shallow} from 'enzyme';
global.React = React;
global.shallow = shallow;
global.mount = mount;
window.__base = path.join(__dirname, '../');
const { connect  } = require('react-redux');
global.connect = connect;
const { createMockStore  } = require('redux-test-utils');
global.createMockStore = createMockStore;
const ModuleApi = require('../out/js/ModuleApi.js');
window.ModuleApi = ModuleApi;

require('./tests/index.js');
