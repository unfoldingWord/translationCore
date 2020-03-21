/* eslint-env jest */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import renderer from 'react-test-renderer';
import Menu from '../js/components/home/projectsManagement/ProjectCardMenu/Menu';

// Tests for ProjectCardMenu React Component
describe('Test ProjectCardMenu component', () => {
  it('Should match snapshot with required props', () => {
    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <Menu
          projectSaveLocation={''}
          translate={key => key}
          onEdit={() => jest.fn()}
          onExportUSFM={() => jest.fn()}
          onExportCSV={() => jest.fn()}
          onUpload={() => jest.fn()}
          user={{}}/>
      </MuiThemeProvider>,
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
