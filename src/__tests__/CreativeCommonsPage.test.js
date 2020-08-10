/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CreativeCommonsPage from '../js/components/home/usersManagement/pages/CreativeCommonsPage';

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

test('snapshot', () => {
  const wrapper = renderer.create(
    <CreativeCommonsPage translate={key => key} onBackClick={jest.fn()}/>,
  );
  expect(wrapper).toMatchSnapshot();
});

test('back', () => {
  const backCallback = jest.fn();
  const wrapper = shallow(
    <CreativeCommonsPage translate={key => key} onBackClick={backCallback}/>,
  );
  wrapper.find('button').simulate('click');
  expect(backCallback).toBeCalled();
});
