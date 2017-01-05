const chai = require('chai');
const assert = chai.assert;
const React = require('react');
const {mount, shallow} = require('enzyme');

const App = require('../src/js/pages/app');
const wrapper = shallow(App);
var newWrapper;
describe('<App />', function() {
  it('should render one <div />', function() {
    assert.equal(wrapper.find('div').length, 1);
  });
  it('should render two <Col />', function() {
    assert.equal(wrapper.find('Col').length, 2);
  });
  it('should render one <ModuleWrapper />', function() {
    assert.equal(wrapper.find('ModuleWrapper').length, 1);
  });
  it('should render <Welcome /> if first time is set to true', function() {
    ModuleApi.setSettings('tutorialView', 'show');
    newWrapper = shallow(App);
    assert.equal(newWrapper.find('Welcome').length, 1)
  });
  it('should not render any <div /> components if first time is set to true', function() {
    assert.equal(newWrapper.find('div').length, 0)
  });
  it('should not render any <ModuleWrapper /> components if first time is set to true', function() {
    assert.equal(newWrapper.find('ModuleWrapper').length, 0)
  });
  it('should not render any components of class .fill-height if first time is set to true', function() {
    assert.equal(newWrapper.find('.fill-height').length, 0);
  });
});
