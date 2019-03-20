import React from 'react';
import renderer from 'react-test-renderer';
import ToolCardBoxes from '../src/js/components/home/toolsManagement/ToolCardBoxes';
jest.mock('material-ui/Checkbox');

test('should have three boxes unchecked', () => {
  const props = {
    toolName: 'translationWords',
    selectedCategories: {'names': ['hi']},
    onChecked: jest.fn(() => {}),
    availableCategories: [],
    translate: jest.fn(() => {}),
  };
  const component = renderer.create(
    <ToolCardBoxes {...props}></ToolCardBoxes>,
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});