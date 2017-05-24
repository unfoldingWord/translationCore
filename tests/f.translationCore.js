const chai = require('chai');
const assert = chai.assert;
const expect = require('chai').expect;
const React = require('react');
const {mount, shallow} = require('enzyme');
const { connect  } = require('react-redux');
const { shallowWithStore } = require('enzyme-redux');
const { createMockStore  } = require('redux-test-utils');
import { Provider } from 'react-redux';
import App from '../src/js/pages/app';

const expectedState = 'expectedState';

const action = {
  type: 'type'
};
const mapDispatchToProps = (dispatch) => ({
  dispatchProp(action) {
    dispatch(action);
  }
});

const mapStateToProps = (state) => ({
  state
});

describe('example shallowWithStore', () => {
  describe('state', () => {
    it('works', () => {
      const ConnectedComponent = connect(mapStateToProps)(App);
      const component = shallowWithStore(<ConnectedComponent />, createMockStore(expectedState));
      expect(component.props().state).to.equal(expectedState);
    });
  });

  describe('dispatch', () => {
    it('works', () => {
      const store = createMockStore();
      const ConnectedComponent = connect(undefined, mapDispatchToProps)(App);
      const component = shallowWithStore(<ConnectedComponent />, store);
      component.props().dispatchProp(action);
      expect(store.isActionDispatched(action)).to.be.true;
    });
  });
});
