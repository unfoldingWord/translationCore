/* eslint-env jest */

import React from 'react';
import { AutoComplete } from 'material-ui';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import LanguageNameTextBox, { selectLanguage, getErrorMessage } from '../js/components/projectValidation/ProjectInformationCheck/LanguageNameTextBox';
import * as LangHelpers from '../js/helpers/LanguageHelpers';

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

describe('Test LanguageNameTextBox.selectLanguage()',()=> {
  let updateLanguageId, updateLanguageName, updateLanguageSettings;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageSettings = jest.fn();
  });

  test('with valid name selection should update all language field', () => {
    // given
    const expectedLanguageID = 'ha';
    const expectedLanguage = LangHelpers.getLanguageByCode(expectedLanguageID);
    const expectedLanguageDir = expectedLanguage.ltr ? 'ltr' : 'rtl';
    const index = -1;

    // when
    selectLanguage(expectedLanguage.name, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguage.name, expectedLanguageDir]);
  });

  test('with valid index should update all language field', () => {
    // given
    const expectedLanguageName = 'Arabic';
    const expectedLanguage = LangHelpers.getLanguageByName(expectedLanguageName);
    const expectedLanguageDir = expectedLanguage.ltr ? 'ltr' : 'rtl';
    const index = getIndexForName(expectedLanguageName);

    // when
    selectLanguage({ code: expectedLanguage.code }, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguage.code, expectedLanguage.name, expectedLanguageDir]);
  });

  test('with invalid name should update language name and clear ID', () => {
    // given
    const index = -1;
    const newlLanguageName = 'zzz';
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageID = '';

    // when
    selectLanguage(newlLanguageName, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });

  test('with null should clear language name and id', () => {
    // given
    const LanguageName = null;
    const index = -1;
    const expectedLanguageID = '';
    const expectedLanguageName = '';

    // when
    selectLanguage(LanguageName, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });
});

describe('Test LanguageNameTextBox.getErrorMessage()',()=> {
  const translate = (key) => key;

  test('should give message for empty language Name', () => {
    // given
    const languageID = null;
    const languageName = '';

    // when
    const results = getErrorMessage(translate, languageName, languageID);

    // then
    expect(results).toEqual('project_validation.field_required');
  });

  test('should give message for invalid language Name', () => {
    // given
    const languageID = '';
    const languageName = 'zzz';

    // when
    const results = getErrorMessage(translate, languageName, languageID);

    // then
    expect(results).toEqual('project_validation.invalid_language_name');
  });

  test('should not give message for valid languageName', () => {
    // given
    const languageID = '';
    const languageName = 'English';

    // when
    const results = getErrorMessage(translate, languageName, languageID);

    // then
    expect(!results).toBeTruthy();
  });

  test('should give message for mismatch languageName and ID', () => {
    // given
    const languageID = 'es';
    const languageName = 'English';

    // when
    const results = getErrorMessage(translate, languageName, languageID);

    // then
    expect(results).toEqual('project_validation.language_mismatch');
  });
});

describe('Test LanguageNameTextBox component',()=>{
  let updateLanguageId, updateLanguageName, updateLanguageSettings;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageSettings = jest.fn();
  });

  test('with valid language should not show error', () => {
    // given
    const languageName = 'English';
    const languageId = 'en';
    const expectedErrorText = '';
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with invalid language should show error', () => {
    // given
    const languageName = 'Englishish';
    const languageId = 'en';
    const expectedErrorText = 'project_validation.invalid_language_name';
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with empty language should show error', () => {
    // given
    const languageName = '';
    const languageId = 'en';
    const expectedErrorText = 'project_validation.field_required';
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with language name & code mismatch should show error', () => {
    // given
    const languageName = 'español';
    const languageId = 'en';
    const expectedErrorText = 'project_validation.language_mismatch';
    const expectedSearchText = languageName;

    // when
    const enzymeWrapper = shallowRenderComponent(languageName, languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('on text change anglicized name should update all language fields', () => {
    // given
    const initialLanguageName = 'English';
    const languageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageName = 'Spanish';
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageID = 'es';
    const expectedLanguageDir = 'ltr';

    // when
    props.onUpdateInput(newlLanguageName);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguageName, expectedLanguageDir]);
  });

  test('on text change invalid name should update language name and clear ID', () => {
    // given
    const initialLanguageName = 'English';
    const languageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageName = 'Spanis';
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageID = '';

    // when
    props.onUpdateInput(newlLanguageName);

    // then
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });

  test('on new text Selection should call all language updates', () => {
    // given
    const initialLanguageName = 'English';
    const languageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageName = 'español';
    const expectedLanguageID = 'es';
    const expectedLanguageName = newlLanguageName;
    const expectedLanguageDir = 'ltr';

    // when
    props.onNewRequest(newlLanguageName, -1);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguageName, expectedLanguageDir]);
  });

  test('on new menu Selection should call all language updates', () => {
    // given
    const index = 100;
    const expectedLanguage = LangHelpers.getLanguagesSortedByName()[index];
    const initialLanguageName = 'English';
    const languageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const expectedLanguageDir = expectedLanguage.ltr ? 'ltr' : 'rtl';

    // when
    props.onNewRequest(null, index);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguage.code, expectedLanguage.name, expectedLanguageDir]);
  });

  test('on new Selection with unmatched name should update language name and clear ID', () => {
    // given
    const initialLanguageName = 'English';
    const languageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageName, languageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageName = 'Spanis';
    const expectedLanguageID = '';
    const expectedLanguageName = newlLanguageName;

    // when
    props.onNewRequest(newlLanguageName, -1);

    // then
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });

  //
  // helpers
  //

  function shallowRenderComponent(languageName, languageId) {
    return shallow(
      <LanguageNameTextBox
        translate={(key) => key}
        languageName={languageName}
        languageId={languageId}
        updateLanguageName={updateLanguageName}
        updateLanguageId={updateLanguageId}
        updateLanguageSettings={updateLanguageSettings}
      />,
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

function verifyCalledOnceWith(func, expectedParameter) {
  expect(func).toHaveBeenCalled();
  expect(func.mock.calls.length).toEqual(1);

  if (!Array.isArray(expectedParameter)) {
    expectedParameter = [expectedParameter];
  }
  expect(func.mock.calls[0]).toEqual(expectedParameter);
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
