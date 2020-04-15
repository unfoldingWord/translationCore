/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import TermsAndConditionsPage from '../js/components/home/usersManagement/pages/TermsAndConditionsPage';

test('snapshot', () => {
  const wrapper = renderer.create(
    <TermsAndConditionsPage translate={key => key}
      onFaithClick={jest.fn()}
      onCreativeClick={jest.fn()}
      onBackClick={jest.fn()}/>,
  );
  expect(wrapper).toMatchSnapshot();
});

describe('callbacks', () => {
  const backCallback = jest.fn();
  const faithCallback = jest.fn();
  const creativeCallback = jest.fn();
  let wrapper = shallow(
    <TermsAndConditionsPage translate={key => key}
      onFaithClick={faithCallback}
      onCreativeClick={creativeCallback}
      onBackClick={backCallback}/>,
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
