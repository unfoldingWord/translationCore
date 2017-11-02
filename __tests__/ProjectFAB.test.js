/* eslint-env jest */

import React from 'react';
import ProjectFAB from '../src/js/components/home/projectsManagement/ProjectsFAB';
import renderer from 'react-test-renderer';

// Tests for ProjectFAB React Component
describe('Test ProjectFAB component',()=>{
  test('Comparing ProjectFAB Component render with snapshot taken 11/02/2017 in __snapshots__ should match', () => {
    const renderedValue =  renderer.create(<ProjectFAB homeScreenReducer={{showFABOptions: true}} />).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
