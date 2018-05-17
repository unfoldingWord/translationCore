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
