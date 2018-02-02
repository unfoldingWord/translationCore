/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';

// Components
import GLDropDownList from '../src/js/components/home/toolsManagement/GLDropDownList';
import ToolCard from       '../src/js/components/home/toolsManagement/ToolCard';
//import ToolsCards from     '../src/js/components/home/toolsManagement/ToolsCards';

describe('Test Gateway Language Drop Down List',() => {
  test('Comparing dropdownlist Component render with snapshot', () => {
    const props = {
      currentGLSelection: 1,
      selectionChange: {ToolCard.selectionChange(0)}
      //manifest: {ToolsCards.manifest}
    };
    const renderedValue = renderer.create(
      <GLDropDownList{...props} />
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
