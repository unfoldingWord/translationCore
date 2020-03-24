/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';

import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import env from 'tc-electron-env';
// Components
import GlDropDownList from '../js/components/home/toolsManagement/GlDropDownList';
import { WORD_ALIGNMENT } from '../js/common/constants';
jest.mock('fs-extra');

const RESOURCE_PATH = path.join(env.home(), 'translationCore', 'resources');
const testResourcePath = path.join(__dirname, 'fixtures/resources');

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
    const copyFiles = ['en/bibles/ult', 'en/translationHelps/translationWords', 'el-x-koine/bibles/ugnt'];
    fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, RESOURCE_PATH);

    const props = {
      currentGLSelection: 1,
      selectionChange: () => {},
      toolName: WORD_ALIGNMENT,
      translate: key => key,
    };
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <GlDropDownList {...props} />
      </MuiThemeProvider>,
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
