/* eslint-env jest */
import React from 'react';
// Mock store set up
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import renderer from 'react-test-renderer';
import OnlineDialog from '../js/components/dialogComponents/OnlineDialog';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('material-ui/Checkbox');

// Tests for OnlineDialog React Component
describe('OnlineDialog Component', () => {
  test('Should render a component that matches snapshot', () => {
    const props = {
      translate: key => key,
      checked: 'false',
      onChecked: jest.fn(),
    };
    const state = { settingsReducer: { onlineMode: false } };
    const store = mockStore(state);

    const tree = renderer.create(
      <OnlineDialog store={store} {...props} />,
    );
    expect(tree).toMatchSnapshot();
  });
});
