/* eslint-env jest */
//helpers

import * as FileConversionHelpers from '../js/helpers/FileConversionHelpers';

describe('FileConversionHelpers.getSafeErrorMessage', () => {
  const defaultMessage = 'DEFAULT';

  it('handles undefined error without crash', () => {
    // given
    const expected = defaultMessage;
    const error = undefined;

    // when
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, defaultMessage);

    // then
    expect(errorMessage).toEqual(expected);
  });

  it('handles error string without crash', () => {
    // given
    const error = 'message';
    const expected = error;

    // when
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, defaultMessage);

    // then
    expect(errorMessage).toEqual(expected);
  });

  it('handles error object without crash', () => {
    // given
    const error = { stuff: true };
    const expected = error;

    // when
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, defaultMessage);

    // then
    expect(errorMessage).toEqual(expected);
  });

  it('handles error div object without crash', () => {
    // given
    const error = { div: {} };
    const expected = error;

    // when
    const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, defaultMessage);

    // then
    expect(errorMessage).toEqual(expected);
  });

  it('handles javascript error without crash', () => {
    // given
    const expected = defaultMessage;

    try {
      const test = null;
      const nullError = test.part;
      console.log(nullError);
    } catch (error) {
      // when
      const errorMessage = FileConversionHelpers.getSafeErrorMessage(error, defaultMessage);

      // then
      expect(errorMessage).toEqual(expected);
    }
  });
  it('handles Promise.reject without crash', async () => {
    // given
    const error = 'STUFF';
    const expected = error;

    try {
      await Promise.reject(error);
    } catch (error_) {
      // when
      const errorMessage = FileConversionHelpers.getSafeErrorMessage(error_, defaultMessage);

      // then
      expect(errorMessage).toEqual(expected);
    }
  });
});
