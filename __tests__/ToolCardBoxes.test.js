import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';
import toJson from 'enzyme-to-json';
import ToolCardBoxes from '../src/js/components/home/toolsManagement/ToolCardBoxes';
jest.mock('material-ui/Checkbox');

test('translationWords should have three boxes unchecked', () => {
  const props = {
    toolName: 'translationWords',
    selectedCategories: ['names'],
    checks: ['kt', 'other', 'names'],
    onChecked: jest.fn(() => {})
  };
  const component = renderer.create(
    <ToolCardBoxes {...props}></ToolCardBoxes>,
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('translationNotes should have 4 boxes checked', () => {
    const availableCategories = {
      cultural:      ["figs-explicit", "translate-symaction" ],
      figures:       ["figs-apostrophe", "figs-doublenegatives" ],
      lexical:       ["translate-numbers", "translate-ordinal" ],
      morphological: ["figs-activepassive", "figs-gendernotations" ],
      other:         ["figs-123person", "figs-abstractnouns" ]
    };
  
    const selectedCategories = [
      "figs-explicit", 
      "translate-symaction", 
      "translate-numbers", 
      "figs-apostrophe",
      "figs-doublenegatives",
      "figs-activepassive",
      "figs-123person" 
    ];
  
    const props = {
      toolName: 'translationNotes',
      selectedCategories: selectedCategories,
      availableCategories: availableCategories,
      checks: ['kt', 'other', 'names'],
      onChecked: jest.fn(() => {}),
      bookId: 'mat',
      translate: jest.fn((txt) => {return "translated: " + txt})
    };
  
  const component = mount(
    <ToolCardBoxes {...props}></ToolCardBoxes>,
  );

  component.setState( {
    expanded: {
      cultural: true,
      figures: true,
      lexical: true,
      morphological: true
    }
  });

  const subCat = toJson(component);
  expect(subCat).toMatchSnapshot();
});