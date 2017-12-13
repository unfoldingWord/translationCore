/* eslint-env jest */

import * as LanguageName from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageNameTextBox';
import * as LangHelpers from "../src/js/helpers/LanguageHelpers";

describe('Test LanguageNameTextBox.selectLanguage()',()=> {
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
    const index = -1;

    // when
    LanguageName.selectLanguage(expectedLanguage.name, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

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
    const index = getIndexForCode(expectedLanguageID);

    // when
    LanguageName.selectLanguage({code: expectedLanguage.code}, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with invalid name should not update languageID', () => {
    // given
    const expectedLanguageID = "zzz";
    const index = -1;

    // when
    LanguageName.selectLanguage(expectedLanguageID, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('with null should not update languageID', () => {
    // given
    const expectedLanguageID = null;
    const index = -1;

    // when
    LanguageName.selectLanguage(expectedLanguageID, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

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

  function getIndexForCode(expectedLanguageID) {
    let index = -1;
    const languagesSortedByName = LangHelpers.getLanguagesSortedByName();
    for (let i = 0; i < languagesSortedByName.length; i++) {
      if (languagesSortedByName[i].code === expectedLanguageID) {
        index = i;
        break;
      }
    }
    return index;
  }
});

describe('Test LanguageNameTextBox.getErrorMessage()',()=>{
  test('should give message for empty language Name', () => {
    // given
    const languageID = null;
    const languageName = "";

    // when
    const results = LanguageName.getErrorMessage(languageName, languageID);

    // then
    expect(results).toEqual("This field is required.");
  });

  test('should give message for invalid language Name', () => {
    // given
    const languageID = "";
    const languageName = "zzz";

    // when
    const results = LanguageName.getErrorMessage(languageName, languageID);

    // then
    expect(results).toEqual("Language Name is not valid");
  });

  test('should not give message for valid languageID', () => {
    // given
    const languageID = "";
    const languageName = "English";

    // when
    const results = LanguageName.getErrorMessage(languageName, languageID);

    // then
    expect(!results).toBeTruthy();
  });

  test('should not give message for valid languageID', () => {
    // given
    const languageID = "ha";
    const languageName = "English";

    // when
    const results = LanguageName.getErrorMessage(languageName, languageID);

    // then
    expect(results).toEqual("Language Name not valid for Code");
  });
});
