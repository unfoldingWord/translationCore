import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import renderer from 'react-test-renderer';
// components
import ProjectInformationCheck from '../js/components/projectValidation/ProjectInformationCheck';

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
        getResourceIdWarning: () => {},
        getDuplicateProjectWarning: () => {},
        displayOverwriteButton: () => {},
      },
      reducers: {
        projectInformationCheckReducer: {
          bookId: 'tit',
          resourceId: 'ult',
          nickname: 'My Project',
          languageId: 'en',
          languageName: 'english',
          languageDirection: 'ltr',
          contributors: ['manny', 'some other guy'],
          checkers: ['manny', 'superman'],
        },
        projectDetailsReducer: { projectSaveLocation: 'dummy' },
        settingsReducer: { currentSettings: { developerMode: false } },
      },
      translate: key => key,
    };

    const renderedValue = renderer.create(
      <MuiThemeProvider>
        <ProjectInformationCheck {...props} />
      </MuiThemeProvider>,
    ).toJSON();
    expect(renderedValue).toMatchSnapshot();
  });
});

describe('ProjectInformationCheck.limitStringLength', () => {
  test('short strings not limited', () => {
    // given
    const text = '123';
    const maxLength = 3;
    const expectedText = text;

    // when
    const results = (new ProjectInformationCheck()).limitStringLength(text, maxLength);

    // then
    expect(results).toEqual(expectedText);
  });

  test('short strings not limited - 6', () => {
    // given
    const text = '123456';
    const maxLength = 6;
    const expectedText = text;

    // when
    const results = (new ProjectInformationCheck()).limitStringLength(text, maxLength);

    // then
    expect(results).toEqual(expectedText);
  });

  test('long strings limited', () => {
    // given
    const text = '1234';
    const maxLength = 3;
    const expectedText = '123';

    // when
    const results = (new ProjectInformationCheck()).limitStringLength(text, maxLength);

    // then
    expect(results).toEqual(expectedText);
  });

  test('long strings limited - 5', () => {
    // given
    const text = '123456';
    const maxLength = 5;
    const expectedText = '12345';

    // when
    const results = (new ProjectInformationCheck()).limitStringLength(text, maxLength);

    // then
    expect(results).toEqual(expectedText);
  });

  test('empty strings not crash', () => {
    // given
    const text = '';
    const maxLength = 5;
    const expectedText = text;

    // when
    const results = (new ProjectInformationCheck()).limitStringLength(text, maxLength);

    // then
    expect(results).toEqual(expectedText);
  });
  test('null strings not crash', () => {
    // given
    const text = null;
    const maxLength = 5;
    const expectedText = text;

    // when
    const results = (new ProjectInformationCheck()).limitStringLength(text, maxLength);

    // then
    expect(results).toEqual(expectedText);
  });
});
