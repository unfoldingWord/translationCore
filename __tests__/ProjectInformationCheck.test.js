import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import renderer from 'react-test-renderer';
// components
import ProjectInformationCheck from '../src/js/components/projectValidation/ProjectInformationCheck';

describe('ProjectInformationCheck', () => {
  test('ProjectInformationCheck component should match snapshot with required props', () => {
    const props = {
      actions: {
        setContributorsInProjectInformationReducer: () => {},
        setCheckersInProjectInformationReducer: () => {},
        setBookIDInProjectInformationReducer: () => {},
        setLanguageDirectionInProjectInformationReducer: () => {},
        setLanguageNameInProjectInformationReducer: () => {},
        setLanguageIdInProjectInformationReducer: () => {},
        setAllLanguageInfoInProjectInformationReducer: () => {},
      },
      reducers: {
        projectInformationCheckReducer: {
          bookId: 'tit',
          languageId: 'en',
          languageName: 'english',
          languageDirection: 'ltr',
          contributors: ['manny', 'some other guy'],
          checkers: ['manny', 'superman']
        }
      },
      translate: key => key
    };

    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ProjectInformationCheck {...props} />
      </MuiThemeProvider>
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});
