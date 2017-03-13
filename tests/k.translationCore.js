const chai = require('chai');
const assert = chai.assert;
const expect = require('chai').expect;
const React = require('react');
const {mount, shallow} = require('enzyme');
const { connect  } = require('react-redux');
const { shallowWithStore } = require('enzyme-redux');
const { createMockStore  } = require('redux-test-utils');
const App = require('../src/js/pages/app');

describe('example shallowWithStore', () => {
  describe('state', () => {
    it('works', () => {
      const expectedState = 'expectedState';
      const mapStateToProps = (state) => ({
        state,
      });
      const ConnectedComponent = connect(mapStateToProps)(App);
      const component = shallowWithStore(<ConnectedComponent />, createMockStore(expectedState));
      expect(component.props().state).to.equal(expectedState);
    });
  });

  describe('dispatch', () => {
    it('works', () => {
      const action = {
        type: 'type',
      };
      const mapDispatchToProps = (dispatch) => ({
        dispatchProp() {
          dispatch(action);
        },
      });
      const store = createMockStore();

      const ConnectedComponent = connect(undefined, mapDispatchToProps)(App);
      const component = shallowWithStore(<ConnectedComponent />, store);
      component.props().dispatchProp();
      expect(store.isActionDispatched(action)).to.be.true;
    });
  });
});
// describe('<App />', function() {}, function() {
//   it('should render one <Application />', function() {
//     assert.equal(wrapper.find('Provider').length, 1);
//   });
//   it('should render one <div />', function() {
//     assert.equal(wrapper.find('div').length, 1);
//   });
//   it('should render two <Col />', function() {
//     assert.equal(wrapper.find('Col').length, 2);
//   });
//   it('should render one <ModuleWrapper />', function() {
//     assert.equal(wrapper.find('ModuleWrapper').length, 1);
//   });
//   it('should render <Welcome /> if first time is set to true', function() {
//     ModuleApi.setSettings('showTutorial', 'show');
//     newWrapper = shallow(App);
//     assert.equal(newWrapper.find('Welcome').length, 1)
//   });
//   it('should not render any <div /> components if first time is set to true', function() {
//     assert.equal(newWrapper.find('div').length, 0)
//   });
//   it('should not render any <ModuleWrapper /> components if first time is set to true', function() {
//     assert.equal(newWrapper.find('ModuleWrapper').length, 0)
//   });
//   it('should not render any components of class .fill-height if first time is set to true', function() {
//     assert.equal(newWrapper.find('.fill-height').length, 0);
//   });
// });
