/* eslint-env jest */

import React from 'react';
import * as LanguageID from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import LanguageIdTextBox from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import * as LangHelpers from "../src/js/helpers/LanguageHelpers";
import {shallow, configure} from "enzyme";
import {AutoComplete} from "material-ui";
import Adapter from 'enzyme-adapter-react-16';

beforeAll(() => {
  configure({adapter: new Adapter()});
});

describe('Test LanguageIdTextBox.selectLanguage()',()=> {
  let updateLanguageId, updateLanguageName, updateLanguageDirection;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageDirection = jest.fn();
  });

  test('with valid code should update all language fields', () => {
    // given
    const expectedLanguageID = "ha";
    const expectedLanguage = LangHelpers.getLanguageByCode(expectedLanguageID);
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";
    const index = -1;

    // when
    LanguageID.selectLanguage(expectedLanguage.code, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with valid index should update all language fields', () => {
    // given
    const expectedLanguageID = "ar";
    const index = getIndexForCode(expectedLanguageID);
    const expectedLanguage = LangHelpers.getLanguagesSortedByCode()[index];
    const expectedLanguageDir = expectedLanguage.ltr ? "ltr" : "rtl";

    // when
    LanguageID.selectLanguage({code: expectedLanguage.code}, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguage.name);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('with invalid code should clear language name', () => {
    // given
    const expectedLanguageID = "zzz";
    const expectedLanguageName = "";
    const index = -1;

    // when
    LanguageID.selectLanguage(expectedLanguageID, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

    // then
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageDirection).not.toHaveBeenCalled();
  });

  test('with null should should clear language name and language ID', () => {
    // given
    const expectedLanguageID = "";
    const expectedLanguageName = "";
    const index = -1;

    // when
    LanguageID.selectLanguage(null, index, updateLanguageName, updateLanguageId, updateLanguageDirection);

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
  const translate = (key) => key;

  test('should give message for empty languageID', () => {
    // given
    const languageID = null;

    // when
    const results = LanguageID.getErrorMessage(translate, languageID);

    // then
    expect(results).toEqual('project_validation.field_required');
  });

  test('should give message for invalid languageID', () => {
    // given
    const languageID = "zzz";

    // when
    const results = LanguageID.getErrorMessage(translate, languageID);

    // then
    expect(results).toEqual('project_validation.invalid_language_code');
  });

  test('should not give message for valid languageID', () => {
    // given
    const languageID = "hsl";

    // when
    const results = LanguageID.getErrorMessage(translate, languageID);

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
    const expectedErrorText = 'project_validation.invalid_language_code';
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with empty language should show error', () => {
    // given
    const languageId = "";
    const expectedErrorText = 'project_validation.field_required';
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
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
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
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
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
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageID = "es";
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = "español";
    const expectedLanguageDir = "ltr";

    // when
    props.onNewRequest(newlLanguageID, -1);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledOnceWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on new menu Selection should update all language fields', () => {
    // given
    const newlLanguageID = "ar";
    const index = getIndexForCode(newlLanguageID);
    const initialLanguageId = "en";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = "Arabic";
    const expectedLanguageDir = "rtl";

    // when
    props.onNewRequest({ code: newlLanguageID }, index);

    // then
    verityCalledOnceWith(updateLanguageName, expectedLanguageName);
    verityCalledWith(updateLanguageId, expectedLanguageID);
    verityCalledOnceWith(updateLanguageDirection, expectedLanguageDir);
  });

  test('on new Selection with null should clear language name and id', () => {
    // given
    const initialLanguageId = "es";
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
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
        translate={key => key}
        languageId={languageId}
        updateLanguageName={updateLanguageName}
        updateLanguageId={updateLanguageId}
        updateLanguageDirection={updateLanguageDirection}
      />
    );
  }

  function verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText) {
    const autoComplete = enzymeWrapper.find(AutoComplete);
    const props = autoComplete.getElement().props;
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

function getIndexForCode(expectedLanguageID) {
  let index = -1;
  const languages = LangHelpers.getLanguagesSortedByCode();
  for (let i = 0; i < languages.length; i++) {
    if ((languages[i].code === expectedLanguageID) || (languages[i].idPrompt === expectedLanguageID)) {
      index = i;
      break;
    }
  }
  return index;
}

