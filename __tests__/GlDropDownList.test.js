/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';

// Components
import GlDropDownList from '../src/js/components/home/toolsManagement/GlDropDownList';
import ToolCard from       '../src/js/components/home/toolsManagement/ToolCard';
import ToolsCards from     '../src/js/components/home/toolsManagement/ToolsCards';

describe('Test Gateway Language Drop Down List',() => {
  test('Comparing dropdownlist Component render with snapshot', () => {
    const props = {
      currentGLSelection: 1,
      selectionChange: {ToolCard.selectionChange()}
      manifest: {ToolsCards.manifest}
    };
    const renderedValue = renderer.create(
      <GlDropdownList{...props} />
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
