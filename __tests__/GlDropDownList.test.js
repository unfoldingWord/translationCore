/* eslint-env jest */
jest.mock('fs-extra');
import ospath from "ospath";
import path from "path-extra";
import fs from 'fs-extra';

import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// Components
import GlDropDownList from '../src/js/components/home/toolsManagement/GlDropDownList';

const RESOURCE_PATH = path.resolve(path.join(ospath.home(), 'translationCore', 'resources'));
const testResourcePath = path.resolve("./__tests__/fixtures/resources/");

describe('Test Gateway Language Drop Down List',() => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('Comparing dropdownlist Component render with snapshot', () => {
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'grc/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const props = {
      currentGLSelection: 1,
      selectionChange: () => {},
      translate: key => key
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <GlDropDownList {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
