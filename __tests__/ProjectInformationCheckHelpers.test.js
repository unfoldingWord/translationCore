'use strict';

// actions
import * as ProjectInformationCheckHelpers from '../src/js/helpers/ProjectInformationCheckHelpers';

describe('ProjectInformationCheckHelpers', () => {

  test('checkLanguageDetails() with valid language settings should be valid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: 'francais',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(false);
  });

  test('checkLanguageDetails() with empty manifest should be invalid', () => {
    // given
    const manifest = { };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with language id & name swapped should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'francais',
        name: 'fr',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with invalid language id should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'zk',
        name: 'Zanaki',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with empty language id should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: '',
        name: 'francais',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with missing language id should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        name: 'francais',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with empty language name should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: '',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with missing language name should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        direction: 'ltr'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with missing language direction should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: 'francais'
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('checkLanguageDetails() with blank language direction should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: 'francais',
        direction: ''
      }
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

});

describe('ProjectInformationCheckHelpers.getResourceIdWarning', () => {
  const translate = key => key;

  test('empty string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('null string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('short string should give warning', () => {
    // given
    const text = 'AA';
    const expectedResults = 'project_validation.field_invalid_length';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('space in string should give warning', () => {
    // given
    const text = 'AA ';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('upper case letters should not give warning', () => {
    // given
    const text = 'ULT';
    const expectedResults = null;

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('lower case letters should not give warning', () => {
    // given
    const text = 'ugnt';
    const expectedResults = null;

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('5 letters should give warning', () => {
    // given
    const text = 'ugnta';
    const expectedResults = 'project_validation.field_invalid_length';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with trailing dash should give warning', () => {
    // given
    const text = 'ab-';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with leading dash should give warning', () => {
    // given
    const text = '-ab';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters containing dash should give warning', () => {
    // given
    const text = 'a-b';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with number should give warning', () => {
    // given
    const text = 'ab1';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with Unicode char should give warning', () => {
    // given
    const text = 'abÀ';
    const expectedResults = 'project_validation.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });
});
