/* eslint-env jest */

import * as LanguageID from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import * as LangHelpers from "../src/js/helpers/LanguageHelpers";

describe('Test LanguageIdTextBox.selectLanguage()',()=> {
  let updateLanguageId, updateLanguageName, updateLanguageDirection;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageDirection = jest.fn();
  });

  test('with string should update languageID', () => {
    // given
    const expectedLanguageID = "ha";
    const expectedLanguage = LangHelpers.getLanguageByCode(expectedLanguageID);
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";

    // when
    LanguageID.selectLanguage(expectedLanguage.code, updateLanguageId, updateLanguageName, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with object should update languageID', () => {
    // given
    const expectedLanguageID = "ar";
    const expectedLanguage = LangHelpers.getLanguageByCode(expectedLanguageID);
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";

    // when
    LanguageID.selectLanguage({code: expectedLanguage.code}, updateLanguageId, updateLanguageName, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with invalid code should not update languageID', () => {
    // given
    const expectedLanguageID = "zzz";

    // when
    LanguageID.selectLanguage(expectedLanguageID, updateLanguageId, updateLanguageName, updateLanguageDirection);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('with null should not update languageID', () => {
    // given
    const expectedLanguageID = null;

    // when
    LanguageID.selectLanguage(expectedLanguageID, updateLanguageId, updateLanguageName, updateLanguageDirection);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  //
  // helpers
  //

  function verityCalledOnceWith(func, expectedParameter) {
    expect(func).toHaveBeenCalled();
    expect(func.mock.calls.length).toEqual(1);
    expect(func.mock.calls[0]).toEqual([expectedParameter]);
  }
});

describe('Test LanguageIdTextBox.getErrorMessage()',()=>{
  test('should give message for empty languageID', () => {
    // given
    const languageID = null;

    // when
    const results = LanguageID.getErrorMessage(languageID);

    // then
    expect(results).toEqual("This field is required.");
  });

  test('should give message for invalid languageID', () => {
    // given
    const languageID = "zzz";

    // when
    const results = LanguageID.getErrorMessage(languageID);

    // then
    expect(results).toEqual("Language ID is not valid");
  });

  test('should not give message for valid languageID', () => {
    // given
    const languageID = "hsl";

    // when
    const results = LanguageID.getErrorMessage(languageID);

    // then
    expect(!results).toBeTruthy();
  });
});
