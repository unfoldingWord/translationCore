/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import ProjectFAB from '../js/components/home/projectsManagement/ProjectsFAB';

// Tests for ProjectFAB React Component
describe('Test ProjectFAB component', () => {
  test('Project FAB should match snapshot with options showing', () => {
    const renderedValue = renderer.create(
      <ProjectFAB
        translate={key => key}
        homeScreenReducer={{ showFABOptions: true }} />,
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });

  test('Project FAB should match snapshot with options not showing', () => {
    const renderedValue = renderer.create(
      <ProjectFAB
        translate={key => key}
        homeScreenReducer={{ showFABOptions: false }} />,
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
