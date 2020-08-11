/* eslint-env jest */
import React from 'react';
import { shallow, configure } from 'enzyme';
import { AutoComplete } from 'material-ui';
import Adapter from 'enzyme-adapter-react-16';
import LanguageIdTextBox, { selectLanguage, getErrorMessage } from '../js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import * as LangHelpers from '../js/helpers/LanguageHelpers';

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

describe('Test LanguageIdTextBox.selectLanguage()',()=> {
  let updateLanguageId, updateLanguageName, updateLanguageSettings;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageSettings = jest.fn();
  });

  test('with valid code should update all language fields', () => {
    // given
    const expectedLanguageID = 'ha';
    const expectedLanguage = LangHelpers.getLanguageByCode(expectedLanguageID);
    const expectedLanguageDir = expectedLanguage.ltr ? 'ltr' : 'rtl';
    const index = -1;

    // when
    selectLanguage(expectedLanguage.code, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguage.name, expectedLanguageDir]);
  });

  test('with valid index should update all language fields', () => {
    // given
    const expectedLanguageID = 'ar';
    const index = getIndexForCode(expectedLanguageID);
    const expectedLanguage = LangHelpers.getLanguagesSortedByCode()[index];
    const expectedLanguageDir = expectedLanguage.ltr ? 'ltr' : 'rtl';

    // when
    selectLanguage({ code: expectedLanguage.code }, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguage.code, expectedLanguage.name, expectedLanguageDir]);
  });

  test('with invalid code should clear language name', () => {
    // given
    const expectedLanguageID = 'zzz';
    const expectedLanguageName = '';
    const index = -1;

    // when
    selectLanguage(expectedLanguageID, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });

  test('with null should should clear language name and language ID', () => {
    // given
    const expectedLanguageID = '';
    const expectedLanguageName = '';
    const index = -1;

    // when
    selectLanguage(null, index, updateLanguageName, updateLanguageId, updateLanguageSettings);

    // then
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });
});

describe('Test LanguageIdTextBox.getErrorMessage()',()=>{
  const translate = (key) => key;

  test('should give message for empty languageID', () => {
    // given
    const languageID = null;

    // when
    const results = getErrorMessage(translate, languageID);

    // then
    expect(results).toEqual('project_validation.field_required');
  });

  test('should give message for invalid languageID', () => {
    // given
    const languageID = 'zzz';

    // when
    const results = getErrorMessage(translate, languageID);

    // then
    expect(results).toEqual('project_validation.invalid_language_code');
  });

  test('should not give message for valid languageID', () => {
    // given
    const languageID = 'hsl';

    // when
    const results = getErrorMessage(translate, languageID);

    // then
    expect(!results).toBeTruthy();
  });
});

describe('Test LanguageIdTextBox component',()=>{
  let updateLanguageId, updateLanguageName, updateLanguageSettings;

  beforeEach(() => {
    updateLanguageId = jest.fn();
    updateLanguageName = jest.fn();
    updateLanguageSettings = jest.fn();
  });

  test('with valid language should not show error', () => {
    // given
    const languageId = 'en';
    const expectedErrorText = '';
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with invalid language should show error', () => {
    // given
    const languageId = 'enj';
    const expectedErrorText = 'project_validation.invalid_language_code';
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('with empty language should show error', () => {
    // given
    const languageId = '';
    const expectedErrorText = 'project_validation.field_required';
    const expectedSearchText = languageId;

    // when
    const enzymeWrapper = shallowRenderComponent(languageId);

    // then
    verifyAutoComplete(enzymeWrapper, expectedSearchText, expectedErrorText);
  });

  test('on text change valid code should update all language fields', () => {
    // given
    const initialLanguageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageID = 'es';
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = 'español';
    const expectedLanguageDir = 'ltr';

    // when
    props.onUpdateInput(newlLanguageID);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguageName, expectedLanguageDir]);
  });

  test('on text change invalid code should update language id and clear name', () => {
    // given
    const initialLanguageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageID = 'eszz';
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = '';


    // when
    props.onUpdateInput(newlLanguageID);

    // then
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
  });

  test('on new text Selection should update all language fields', () => {
    // given
    const initialLanguageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageID = 'es';
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = 'español';
    const expectedLanguageDir = 'ltr';

    // when
    props.onNewRequest(newlLanguageID, -1);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguageName, expectedLanguageDir]);
  });

  test('on new menu Selection should update all language fields', () => {
    // given
    const newlLanguageID = 'ar';
    const index = getIndexForCode(newlLanguageID);
    const initialLanguageId = 'en';
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const expectedLanguageID = newlLanguageID;
    const expectedLanguageName = 'Arabic';
    const expectedLanguageDir = 'rtl';

    // when
    props.onNewRequest({ code: newlLanguageID }, index);

    // then
    expect(updateLanguageId).not.toHaveBeenCalled();
    expect(updateLanguageName).not.toHaveBeenCalled();
    verifyCalledOnceWith(updateLanguageSettings, [expectedLanguageID, expectedLanguageName, expectedLanguageDir]);
  });

  test('on new Selection with null should clear language name and id', () => {
    // given
    const initialLanguageId = 'es';
    const enzymeWrapper = shallowRenderComponent(initialLanguageId);
    const props = enzymeWrapper.find(AutoComplete).getElement().props;
    const newlLanguageID = null;
    const expectedLanguageID = '';
    const expectedLanguageName = '';

    // when
    props.onNewRequest(newlLanguageID, -1);

    // then
    verifyCalledOnceWith(updateLanguageName, expectedLanguageName);
    verifyCalledOnceWith(updateLanguageId, expectedLanguageID);
    expect(updateLanguageSettings).not.toHaveBeenCalled();
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

