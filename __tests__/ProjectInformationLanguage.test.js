/* eslint-env jest */

// import React from 'react';
// import renderer from 'react-test-renderer';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as languageID from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageIdTextBox';
import * as languageName from '../src/js/components/projectValidation/ProjectInformationCheck/LanguageNameTextBox';

describe('Test LanguageIdTextBox component',()=>{
  test('getLanguageIDs() should work', () => {
    const languages = languageID.getLanguageIDs();
    const langCount = languages.length;
    expect(langCount).toBeGreaterThan(8019);
  });
});

describe('Test LanguageNameTextBox component',()=>{
  test('getLanguages() should work', () => {
    const languages = languageName.getLanguages();
    const langCount = languages.length;
    expect(langCount).toBeGreaterThan(8019);
  });
});
