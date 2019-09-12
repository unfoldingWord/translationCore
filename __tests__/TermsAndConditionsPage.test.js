/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import TermsAndConditionsPage from '../src/js/components/home/usersManagement/pages/TermsAndConditionsPage';

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

test('snapshot', () => {
  const wrapper = renderer.create(
    <TermsAndConditionsPage translate={key => key}
      onFaithClick={jest.fn()}
      onCreativeClick={jest.fn()}
      onBackClick={jest.fn()}/>
  );
  expect(wrapper).toMatchSnapshot();
});

describe('callbacks', () => {
  configure({ adapter: new Adapter() });
  const backCallback = jest.fn();
  const faithCallback = jest.fn();
  const creativeCallback = jest.fn();
  let wrapper = shallow(
    <TermsAndConditionsPage translate={key => key}
      onFaithClick={faithCallback}
      onCreativeClick={creativeCallback}
      onBackClick={backCallback}/>
  );

  beforeEach(() => {
    backCallback.mockReset();
    faithCallback.mockReset();
    creativeCallback.mockReset();
  });

  test('back', () => {
    wrapper.find('button').simulate('click');
    expect(backCallback).toBeCalled();
    expect(faithCallback).not.toBeCalled();
    expect(creativeCallback).not.toBeCalled();
  });

  test('creative', () => {
    wrapper.find('#creative-link').simulate('click');
    expect(creativeCallback).toBeCalled();
    expect(backCallback).not.toBeCalled();
    expect(faithCallback).not.toBeCalled();
  });

  test('faith', () => {
    wrapper.find('#faith-link').simulate('click');
    expect(faithCallback).toBeCalled();
    expect(creativeCallback).not.toBeCalled();
    expect(backCallback).not.toBeCalled();
  });
});
