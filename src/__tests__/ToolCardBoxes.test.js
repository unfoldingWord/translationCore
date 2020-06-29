import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ToolCardBoxes from '../js/components/home/toolsManagement/ToolCardBoxes';
import { TRANSLATION_WORDS, TRANSLATION_NOTES } from '../js/common/constants';

jest.mock('material-ui/Checkbox');

test('translationWords should have three boxes unchecked', () => {
  const props = {
    toolName: TRANSLATION_WORDS,
    selectedCategories: [],
    onChecked: jest.fn(() => {}),
    availableCategories: {},
    translate: jest.fn(() => {}),
    selectedGL: 'en',
    showPopover: jest.fn(() => {}),
  };
  const component = renderer.create(
    <ToolCardBoxes {...props}></ToolCardBoxes>,
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('translationNotes should have 4 boxes checked', () => {
  const availableCategories = {
    discourse: ['writing-background', 'writing-endofstory'],
    numbers: ['translate-numbers', 'translate-fraction'],
    figures: [
      'figs-idiom',
      'figs-irony',
      'figs-metaphor',
      'figs-rquestion',
      'figs-simile',
      'figs-apostrophe',
      'figs-euphemism',
    ],
    culture: ['figs-explicit'],
    grammar: [
      'figs-hypo',
      'figs-activepassive',
      'figs-gendernotations',
      'figs-pronouns',
      'figs-you',
      'figs-123person',
      'figs-abstractnouns',
      'figs-distinguish',
    ],
  };
  const selectedCategories = [
    'writing-background',
    'translate-numbers',
    'translate-fraction',
    'figs-idiom',
    'figs-irony',
    'figs-metaphor',
    'figs-rquestion',
    'figs-simile',
    'figs-apostrophe',
    'figs-explicit',
    'figs-hypo',
    'figs-activepassive',
    'figs-pronouns',
    'figs-you',
    'figs-123person',
    'figs-abstractnouns',
  ];
  const props = {
    toolName: TRANSLATION_NOTES,
    selectedCategories,
    availableCategories,
    checks: ['figs-gendernotations', 'figs-pronouns', 'figs-irony'],
    onChecked: jest.fn(() => {}),
    bookId: 'tit',
    translate: jest.fn((txt) => 'translated: ' + txt),
    selectedGL: 'en',
    showPopover: jest.fn(() => {}),
    onCategoryChecked: jest.fn(() => {}),
    onSubcategoryChecked: jest.fn(() => {}),
  };

  const component = shallow(
    <ToolCardBoxes {...props}></ToolCardBoxes>,
  );

  component.setState({
    expanded: {
      grammar: true,
      figures: true,
      discourse: true,
      numbers: true,
    },
  });

  const subCat = toJson(component);
  expect(subCat).toMatchSnapshot();
});
