/* eslint-env jest */

import React from 'react';
import * as LangName from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageNameTextBox';
import LanguageNameTextBox from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageNameTextBox';
import * as LangHelpers from "../src/js/helpers/LanguageHelpers";
import { AutoComplete } from 'material-ui';
import {shallow} from 'enzyme';

describe('Test LanguageNameTextBox.selectLanguage()',()=> {
  let updateLanguageId, updateLanguageName, updateLanguageDirection;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageDirection = jest.fn();
  });

  test('with valid name selection should update all language field', () => {
    // given
    const expectedLanguageID = "ha";
    const expectedLanguage = LangHelpers.getLanguageByCode(expectedLanguageID);
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";
    const index = -1;

    // when
    LangName.selectLanguage(expectedLanguage.name, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with valid index should update all language field', () => {
    // given
    const expectedLanguageName = "Arabic";
    const expectedLanguage = LangHelpers.getLanguageByName(expectedLanguageName);
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";
    const index = getIndexForName(expectedLanguageName);

    // when
    LangName.selectLanguage({code: expectedLanguage.code}, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguage.code);
    verityCalledWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with invalid name should update language name and clear ID', () => {
    // given
    const index = -1;
    const newlLanguageName = "zzz";
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageID = "";

    // when
    LangName.selectLanguage(newlLanguageName, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('with null should clear language name and id', () => {
    // given
    const LanguageName = null;
    const index = -1;
    const expectedLanguageID = "";
    const expectedLanguageName = "";

    // when
    LangName.selectLanguage(LanguageName, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });
});

describe('Test LanguageNameTextBox.getErrorMessage()',()=> {
  test('should give message for empty language Name', () => {
    // given
    const languageID = null;
    const languageName = "";

    // when
    const results = LangName.getErrorMessage(languageName, languageID);

    // then
    expect(results).toEqual("This field is required.");
  });

  test('should give message for invalid language Name', () => {
    // given
    const languageID = "";
    const languageName = "zzz";

    // when
    const results = LangName.getErrorMessage(languageName, languageID);

    // then
    expect(results).toEqual("Language Name is not valid");
  });

  test('should not give message for valid languageName', () => {
    // given
    const languageID = "";
    const languageName = "English";

    // when
    const results = LangName.getErrorMessage(languageName, languageID);

    // then
    expect(!results).toBeTruthy();
  });

  test('should give message for mismatch languageName and ID', () => {
    // given
    const languageID = "es";
    const languageName = "English";

    // when
    const results = LangName.getErrorMessage(languageName, languageID);

    // then
    expect(results).toEqual("Language Name not valid for Code");
  });
});

describe('Test LanguageNameTextBox component',()=>{
  let updateLanguageId, updateLanguageName, updateLanguageDirection;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageDirection = jest.fn();
  });

  test('with valid language should not show error', () => {
    // given
    const languageName = "English";
    const languageId = "en";
    const expectedErrorText = "";
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with invalid language should show error', () => {
    // given
    const languageName = "Englishish";
    const languageId = "en";
    const expectedErrorText = "Language Name is not valid";
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with empty language should show error', () => {
    // given
    const languageName = "";
    const languageId = "en";
    const expectedErrorText = "This field is required.";
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with language name & code mismatch should show error', () => {
    // given
    const languageName = "español";
    const languageId = "en";
    const expectedErrorText = "Language Name not valid for Code";
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('on text change anglicized name should update all language fields', () => {
    // given
    const initialLanguageName = "English";
    const languageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageName = "Spanish";
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageID = "es";
    const expectedLanguageDir = "ltr";

    // when
    props.onUpdateInput(newlLanguageName);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on text change invalid name should update language name and clear ID', () => {
    // given
    const initialLanguageName = "English";
    const languageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageName = "Spanis";
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageID = "";

    // when
    props.onUpdateInput(newlLanguageName);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('on new text Selection should call all language updates', () => {
    // given
    const initialLanguageName = "English";
    const languageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageName = "español";
    const expectedLanguageID = "es";
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageDir = "ltr";

    // when
    props.onNewRequest(newlLanguageName, -1);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on new menu Selection should call all language updates', () => {
    // given
    const index = 100;
    const expectedLanguage = LangHelpers.getLanguagesSortedByName()[index];
    const initialLanguageName = "English";
    const languageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";

    // when
    props.onNewRequest(null, index);

    // then
    verityCalledWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageId, expectedLanguage.code);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on new Selection with unmatched name should update language name and clear ID', () => {
    // given
    const initialLanguageName = "English";
    const languageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getNode().props;
    const newlLanguageName = "Spanis";
    const expectedLanguageID = "";
    const expectedLanguageName = newlLanguageName;

    // when
    props.onNewRequest(newlLanguageName, -1);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  //
  // helpers
  //

  function shallowRenderComponent(languageName, languageId) {
    return shallow(
      <LanguageNameTextBox
        languageName={languageName}
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

function verityCalledWith(func, expectedParameter) {
  expect(func).toHaveBeenCalled();
  expect(func.mock.calls.length).toBeGreaterThan(0);
  expect(func.mock.calls[func.mock.calls.length-1]).toEqual([expectedParameter]);
}

function getIndexForName(expectedLanguageName) {
  let index = -1;
  const languagesSortedByName = LangHelpers.getLanguagesSortedByName();
  for (let i = 0; i < languagesSortedByName.length; i++) {
    if ((languagesSortedByName[i].name === expectedLanguageName) || (languagesSortedByName[i].namePrompt === expectedLanguageName)) {
      index = i;
      break;
    }
  }
  return index;
}
