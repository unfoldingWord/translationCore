/* eslint-env jest */
import React from 'react';
// Mock store set up
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
import renderer from 'react-test-renderer';
import OnlineDialog from '../src/js/components/dialogComponents/OnlineDialog';
jest.mock('material-ui/Checkbox');

// Tests for OnlineDialog React Component
describe('OnlineDialog Componenet', () => {
  test('Should render a component that matches snapshot', () => {
    const props = {
      translate: key => key,
      checked: 'false',
      onChecked: jest.fn()
    };
    const state = {
      settingsReducer: {
        onlineMode: false
      }
    };
    const store = mockStore(state);

    const tree = renderer.create(
      <OnlineDialog store={store} {...props} />
    );
    expect(tree).toMatchSnapshot();
  });
});