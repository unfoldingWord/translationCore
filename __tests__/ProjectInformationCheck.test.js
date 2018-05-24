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
          resourceId: 'ult',
          nickname: 'My Project',
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

describe('ProjectInformationCheck.getEmptyWarning', () => {
  const translate = key => key;

  test('empty string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = (new ProjectInformationCheck).getEmptyWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('null string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = (new ProjectInformationCheck).getEmptyWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('non-empty string should not give warning', () => {
    // given
    const text = 'A';
    const expectedResults = null;

    // when
    const results = (new ProjectInformationCheck).getEmptyWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });
});

describe('ProjectInformationCheck.getResourceIdWarning', () => {
  const translate = key => key;

  test('empty string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('null string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('short string should give warning', () => {
    // given
    const text = 'A';
    const expectedResults = 'project_validation.field_too_short';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('space in string should give warning', () => {
    // given
    const text = 'A ';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('upper case letters should not give warning', () => {
    // given
    const text = 'AA';
    const expectedResults = null;

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('lower case letters should not give warning', () => {
    // given
    const text = 'aa';
    const expectedResults = null;

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letter with trailing dash should give warning', () => {
    // given
    const text = 'a-';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letter with leading dash should give warning', () => {
    // given
    const text = '-a';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with number should give warning', () => {
    // given
    const text = 'ab1';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = (new ProjectInformationCheck).getResourceIdWarning(text, translate);

    // then
    expect(results).toEqual(expectedResults);
  });
});
