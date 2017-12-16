/* eslint-env jest */

import React from 'react';
import * as LanguageID from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import LanguageIdTextBox from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import * as LangHelpers from "../src/js/helpers/LanguageHelpers";
import {shallow} from "enzyme/build/index";
import {AutoComplete} from "material-ui";

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

  test('with invalid code should clear language name', () => {
    // given
    const expectedLanguageID = "zzz";
    const expectedLanguageName = "";

    // when
    LanguageID.selectLanguage(expectedLanguageID, updateLanguageId, updateLanguageName, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('with null should should clear language name and language ID', () => {
    // given
    const expectedLanguageID = "";
    const expectedLanguageName = "";

    // when
    LanguageID.selectLanguage(null, updateLanguageId, updateLanguageName, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
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

describe('Test LanguageIdTextBox component',()=>{
  let updateLanguageId, updateLanguageName, updateLanguageDirection;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageDirection = jest.fn();
  });

  test('with valid language should not show error', () => {
    // given
    const languageId = "en";
    const expectedErrorText = "";
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with invalid language should show error', () => {
    // given
    const languageId = "enj";
    const expectedErrorText = "Language ID is not valid";
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with empty language should show error', () => {
    // given
    const languageId = "";
    const expectedErrorText = "This field is required.";
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('on text change valid code should update all language fields', () => {
    // given
    const initialLanguageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageID = "es";
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = "español";
    const expectedLanguageDir = "ltr";

    // when
    props.onUpdateInput(newlLanguageID);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on text change invalid code should update language id and clear name', () => {
    // given
    const initialLanguageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageID = "eszz";
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = "";


    // when
    props.onUpdateInput(newlLanguageID);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('on new text Selection should update all language fields', () => {
    // given
    const initialLanguageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageID = "es";
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = "español";
    const expectedLanguageDir = "ltr";

    // when
    props.onNewRequest(newlLanguageID);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on new menu Selection should update all language fields', () => {
    // given
    const initialLanguageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageID = "ar";
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = "العربية";
    const expectedLanguageDir = "rtl";

    // when
    props.onNewRequest({ code: newlLanguageID });

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on new Selection with null should clear language name and id', () => {
    // given
    const initialLanguageId = "es";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageID = null;
    const expectedLanguageID = "";
    const expectedLanguageName = "";

    // when
    props.onNewRequest(newlLanguageID, -1);

   // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  //
  // helpers
  //

  function shallowRenderComponent(languageId) {
    return shallow(
      <LanguageIdTextBox
        languageId={languageId}
        updateLanguageName={updateLanguageName}
        updateLanguageId={updateLanguageId}
        updateLanguageDirection={updateLanguageDirection}
      />
    );
  }

  function verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText) {
    const autoComplete = enzymeWrapper.find(AutoComplete);
    const props = autoComplete.getNode().props;
    expect(props.errorText).toEqual(expectedErrorText);
    expect(props.searchText).toEqual(expectedSearchText);
  }
});

//
// helpers
//

function verityCalledOnceWith(func, expectedParameter) {
  expect(func).toHaveBeenCalled();
  expect(func.mock.calls.length).toEqual(1);
  expect(func.mock.calls[0]).toEqual([expectedParameter]);
}

