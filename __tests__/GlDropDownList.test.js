/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import GlDropDownList from  '../src/js/components/home/toolsManagement/GlDropDownList';
import ToolCard from '../src/js/components/home/toolsManagement/ToolCard';
describe('Test Gateway Language Drop Down List',() => {
  test('Comparing dropdownlist Component render with snapshot', () => {
    const props = {
      currentGLSelection: 1,
      selectionChange: {ToolCard.selectionChange()}
    };
    const renderedValue = renderer.create(
      <GlDropdownList{...props} />
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
